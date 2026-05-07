'use server'

import { prisma } from '@/lib/prisma'

export type CheckoutPayload = {
  tenantId: string;
  deliveryAddress: any; // Mapeado a JSON en Prisma
  paymentMethod: string;
  items: Array<{
    variantId: string;
    qty: number;
    // El precio real se extraerá del backend para evitar spoofing
  }>;
};

export type CheckoutResponse = {
  success: boolean;
  orderId?: string;
  paymentToken?: string;
  paymentUrl?: string;
  error?: string;
};

/**
 * Server Action: Process Checkout (Phase 1: Intent)
 * 1. Valida usuario, inventario y tenant.
 * 2. Ejecuta $transaction (Order -> OrderLine -> Transaction).
 * 3. Reserva el stock (decrementa `stockQty`).
 * 4. Devuelve un Intent listo para ser pagado por BAC/Pagadito.
 * NOTA: Los envíos y el escrow se difieren hasta la confirmación de pago.
 */
export async function processCheckout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  try {
    const { tenantId, deliveryAddress, paymentMethod, items } = payload;

    // 1. Autenticación Real (Reemplaza buyerId simulado)
    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error("Unauthorized. Por favor inicia sesión para completar la compra.");
    }
    const buyerId = user.id;

    // 2. Validaciones Críticas Base
    if (!items || items.length === 0) throw new Error("Cart is empty");
    if (!tenantId) throw new Error("Missing tenant info");

    // 2. Extraer precios reales y data de DB (Anti-spoofing)
    const variantIds = items.map(i => i.variantId);
    
    const variantsDb = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: {
        Product: true
      }
    });

    if (variantsDb.length !== items.length) {
      throw new Error("One or more variants not found in database or belong to different store");
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new Error("Tenant not found");

    // 3. Mapear items validando stock e integrando precios
    let baseTotal = 0;
    const validatedItems = items.map(cartItem => {
      const dbVariant = variantsDb.find(v => v.id === cartItem.variantId);
      if (!dbVariant) throw new Error("Variant missing");
      
      // Validación de Stock (Race Condition 1er paso)
      if (dbVariant.stockQty < cartItem.qty) {
        throw new Error(`Insufficient stock for SKU: ${dbVariant.sku}`);
      }
      
      const unitPriceSnap = dbVariant.Product.basePrice; // En centavos
      const storeId = dbVariant.Product.storeId;
      
      baseTotal += unitPriceSnap * cartItem.qty;
      
      return {
        variantId: cartItem.variantId,
        qty: cartItem.qty,
        unitPriceSnap,
        storeId,
        productId: dbVariant.productId
      };
    });

    // Cálculos Finales
    const taxRate = Number(tenant.taxRate) / 100;
    const taxTotal = Math.round(baseTotal * taxRate); // Centavos
    const shippingTotal = 0; // Flat 0 para Milestone 1
    const grandTotal = baseTotal + taxTotal + shippingTotal;

    // 4. Agrupar items por StoreId para el Escrow y Logística
    const itemsByStore = validatedItems.reduce((acc, item) => {
      if (!acc[item.storeId]) acc[item.storeId] = [];
      acc[item.storeId].push(item);
      return acc;
    }, {} as Record<string, typeof validatedItems>);

    // ==========================================
    // 5. INICIAR TRANSACCIÓN ATÓMICA DE PRISMA
    // ==========================================
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Crear Order Matriz
      const order = await tx.order.create({
        data: {
          tenantId,
          buyerId,
          baseTotal,
          taxTotal,
          shippingTotal,
          grandTotal,
          status: "AWAITING_PAYMENT", // Real payment logic will be implemented next
          deliveryAddress,
        }
      });

      // B. Procesar Reserva por cada Seller (Store)
      for (const storeId of Object.keys(itemsByStore)) {
        const storeItems = itemsByStore[storeId];
        
        // B.1 Crear OrderLines
        for (const item of storeItems) {
          await tx.orderLine.create({
            data: {
              orderId: order.id,
              storeId: item.storeId,
              variantId: item.variantId,
              qty: item.qty,
              unitPriceSnap: item.unitPriceSnap
            }
          });
          
          // B.2 Reducir stock concurrentemente (RESERVA)
          // Esto previene race conditions de inventario.
          // Si el pago expira o falla, un cron/webhook deberá hacer el rollback.
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQty: { decrement: item.qty } }
          });
        }
      }

      // C. Registrar Transacción Financiera Intent (PENDING)
      // Esta es la abstracción base para el provider.
      const transaction = await tx.transaction.create({
        data: {
          orderId: order.id,
          providerId: paymentMethod || "UNKNOWN",
          amount: grandTotal,
          status: "PENDING",
          payload: { 
            note: "Payment intent initialized",
            currency: tenant.currencyCode,
          }
        }
      });

      return {
        orderId: order.id,
        transactionId: transaction.id
      };
    });

    // ==========================================
    // RESULTADO EXITOSO - PROVIDER FOUNDATION
    // ==========================================
    // Aquí es donde AZHON llamaría a BAC o Pagadito para obtener el token/URL de pago.
    
    let paymentUrl = '';
    let paymentToken = '';

    try {
      const { getPaymentProvider } = await import('@/lib/providers/paymentFactory');
      const provider = getPaymentProvider(paymentMethod);
      const intent = await provider.generatePaymentIntent(result.transactionId, grandTotal, tenant.currencyCode);
      paymentToken = intent.paymentToken;
      paymentUrl = intent.paymentUrl;
    } catch (e: any) {
      console.warn("Falling back to local redirect due to provider error or missing provider:", e.message);
      paymentUrl = `/${tenant.countryCode.toLowerCase()}/perfil/ordenes/${result.orderId}`; // Fallback temporal
    }

    return {
      success: true,
      orderId: result.orderId,
      paymentToken,
      paymentUrl
    };

  } catch (error: any) {
    console.error("[Checkout Server Action Error]:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

/**
 * Server Action: Confirm Order Payment (Phase 2: Fulfillment trigger)
 * Llamado por el Webhook de BAC/Pagadito tras pago exitoso.
 * 1. Verifica la Transacción.
 * 2. Actualiza Transaction -> SUCCESS.
 * 3. Actualiza Order -> PAID.
 * 4. Ejecuta el Split (Shipments y Escrow).
 */
export async function confirmOrderPayment(transactionId: string, providerExternalId: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Validar transacción pendiente
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: { Order: { include: { OrderLines: true } } }
      });

      if (!transaction) throw new Error("Transaction not found");
      if (transaction.status === "SUCCESS") return { success: true, message: "Already processed" };
      if (transaction.status !== "PENDING") throw new Error(`Cannot confirm transaction in status: ${transaction.status}`);

      // 2. Actualizar estados financieros
      await tx.transaction.update({
        where: { id: transactionId },
        data: { 
          status: "SUCCESS",
          payload: { externalId: providerExternalId }
        }
      });

      await tx.order.update({
        where: { id: transaction.orderId },
        data: { status: "PAID" }
      });

      // 3. Procesar Fulfillment y Escrow por Store (Split)
      const itemsByStore = transaction.Order.OrderLines.reduce((acc, item) => {
        if (!acc[item.storeId]) acc[item.storeId] = [];
        acc[item.storeId].push(item);
        return acc;
      }, {} as Record<string, typeof transaction.Order.OrderLines>);

      const shipmentIds: string[] = [];
      const escrowEntries: string[] = [];

      for (const storeId of Object.keys(itemsByStore)) {
        const storeItems = itemsByStore[storeId];
        let storeSubtotal = 0;
        
        // Crear Shipment independiente
        const shipment = await tx.shipment.create({
          data: {
            orderId: transaction.orderId,
            storeId: storeId,
            status: "PREPARING",
            destinationType: "HOME" // TODO: Read from order config if needed
          }
        });
        shipmentIds.push(shipment.id);

        for (const ol of storeItems) {
          storeSubtotal += ol.unitPriceSnap * ol.qty;

          // Enlazar OrderLines al Shipment
          await tx.shipmentItem.create({
            data: {
              shipmentId: shipment.id,
              orderLineId: ol.id,
              qty: ol.qty
            }
          });
        }
        
        // Retener Fondos a favor del Seller (EscrowLedger)
        const escrow = await tx.escrowLedger.create({
          data: {
            storeId: storeId,
            orderId: transaction.orderId,
            amount: storeSubtotal,
            entryType: "CREDIT",
            reason: "HOLD"
          }
        });
        escrowEntries.push(escrow.id);
      }

      return {
        orderId: transaction.orderId,
        shipmentIds,
        escrowEntries
      };
    });

    return { success: true, ...result };
  } catch (error: any) {
    console.error("[Payment Confirmation Error]:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action / Cron Helper: Expire Abandoned Orders (Rollback)
 * 1. Busca transacciones PENDING de órdenes AWAITING_PAYMENT más antiguas que X minutos.
 * 2. Restaura el stock de los productos.
 * 3. Marca la Transacción como EXPIRED.
 * 4. Marca la Orden como PAYMENT_EXPIRED.
 */
export async function expireAbandonedOrders(minutesOld: number = 30) {
  try {
    const expirationTime = new Date(Date.now() - minutesOld * 60000);

    // Encontrar órdenes que expiraron
    const abandonedTransactions = await prisma.transaction.findMany({
      where: {
        status: "PENDING",
        createdAt: { lt: expirationTime },
        Order: { status: "AWAITING_PAYMENT" }
      },
      include: {
        Order: { include: { OrderLines: true } }
      }
    });

    if (abandonedTransactions.length === 0) {
      return { success: true, expiredCount: 0 };
    }

    let expiredCount = 0;

    for (const transaction of abandonedTransactions) {
      await prisma.$transaction(async (tx) => {
        // 1. Restaurar stock (Rollback de Reserva)
        for (const ol of transaction.Order.OrderLines) {
          await tx.productVariant.update({
            where: { id: ol.variantId },
            data: { stockQty: { increment: ol.qty } }
          });
        }

        // 2. Marcar transacción como expirada
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: "EXPIRED", payload: { note: "Payment intent expired by system sweep" } }
        });

        // 3. Marcar orden como expirada
        await tx.order.update({
          where: { id: transaction.orderId },
          data: { status: "PAYMENT_EXPIRED" }
        });
      });
      expiredCount++;
    }

    return { success: true, expiredCount };
  } catch (error: any) {
    console.error("[Expiration Sweep Error]:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action: Rebuild Cart
 * Clona los items de una orden fallida/expirada de vuelta a la cookie del carrito.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function rebuildCartAndRedirect(orderId: string, countryCode: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { OrderLines: true }
    });

    if (!order) throw new Error("Order not found");
    if (order.status !== 'PAYMENT_FAILED' && order.status !== 'PAYMENT_EXPIRED') {
      throw new Error("Only failed orders can be rebuilt");
    }

    const cartState = order.OrderLines.map(ol => ({
      variantId: ol.variantId,
      qty: ol.qty
    }));

    cookies().set('azhon_cart', JSON.stringify(cartState), { path: '/' });
    
  } catch (error: any) {
    return { success: false, error: error.message };
  }

  // Ejecutamos el redirect fuera del try-catch porque redirect() lanza un error internamente (Next.js internals)
  redirect(`/${countryCode}/cart`);
}
