import { NextResponse } from 'next/server';
import { confirmOrderPayment } from '@/app/actions/checkout';
import { prisma } from '@/lib/prisma';
import { getPaymentProvider } from '@/lib/providers/paymentFactory';
import { logPaymentEvent } from '@/lib/providers/paymentSupport';

/**
 * Webhook Entry Point para BAC y Pagadito
 * Este endpoint implementa validación de firma y normalización.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const headersRaw = Object.fromEntries(request.headers.entries());
    
    // El provider debe venir en la URL, query params o ser inferido por el endpoint
    // Para este caso asumimos que el webhook recibe ?provider=BAC_HN
    const url = new URL(request.url);
    const providerId = url.searchParams.get('provider') || body.provider;

    if (!providerId) {
      logPaymentEvent({ level: 'WARN', action: 'WEBHOOK_RECEIVED', message: 'Missing provider context' });
      return NextResponse.json({ error: "Missing provider context" }, { status: 400 });
    }

    const providerAdapter = getPaymentProvider(providerId);

    // 1. Webhook Signature Validation (Hardening)
    const isValid = providerAdapter.validateWebhookSignature(body, headersRaw);
    if (!isValid) {
      logPaymentEvent({ 
        level: 'ERROR', 
        action: 'WEBHOOK_SIGNATURE_FAILED', 
        providerId, 
        message: 'Invalid cryptographic signature',
        rawPayload: body
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 2. Normalización de payload
    const normalized = providerAdapter.normalizeWebhookPayload(body);
    const { transactionId, externalId, status } = normalized;

    if (!transactionId || !externalId) {
      logPaymentEvent({ level: 'WARN', action: 'WEBHOOK_NORMALIZATION_FAILED', providerId, message: 'Missing fields after normalization', rawPayload: normalized });
      return NextResponse.json({ error: "Missing normalized fields" }, { status: 400 });
    }

    // 3. Idempotency & Provider check base
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { Order: { include: { OrderLines: true } } }
    });

    if (!transaction) {
      logPaymentEvent({ level: 'WARN', action: 'WEBHOOK_TX_NOT_FOUND', transactionId, message: 'Transaction ID not found in DB' });
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (transaction.providerId !== providerId) {
      logPaymentEvent({ level: 'ERROR', action: 'WEBHOOK_PROVIDER_MISMATCH', transactionId, providerId, message: `Expected ${transaction.providerId} but got ${providerId}` });
      return NextResponse.json({ error: "Provider mismatch" }, { status: 403 });
    }

    if (transaction.status !== "PENDING") {
      logPaymentEvent({ level: 'INFO', action: 'WEBHOOK_IDEMPOTENCY_HIT', transactionId, status: transaction.status as any, message: 'Already processed' });
      return NextResponse.json({ success: true, message: `Already processed (${transaction.status})` });
    }

    logPaymentEvent({ level: 'INFO', action: 'WEBHOOK_PROCESSING_START', transactionId, providerId, externalId, status, message: 'Starting reconciliation' });

    // 4. Lógica de reconciliación
    if (status === 'SUCCESS') {
      
      const confirmationResult = await confirmOrderPayment(transactionId, externalId);
      
      if (!confirmationResult.success) {
        logPaymentEvent({ level: 'ERROR', action: 'WEBHOOK_CONFIRMATION_FAILED', transactionId, message: confirmationResult.error || 'Failed to confirm order' });
        return NextResponse.json({ error: confirmationResult.error }, { status: 422 });
      }

      logPaymentEvent({ level: 'INFO', action: 'WEBHOOK_CONFIRMATION_SUCCESS', transactionId, orderId: transaction.orderId, message: 'Order successfully finalized' });
      return NextResponse.json({ 
        success: true, 
        message: "Payment confirmed, order finalized",
        orderId: 'orderId' in confirmationResult ? confirmationResult.orderId : undefined
      });

    } else if (status === 'FAILED' || status === 'EXPIRED') {
      
      // Rollback Explícito para pagos fallidos detectados por webhook
      await prisma.$transaction(async (tx) => {
        // Restaurar stock
        for (const ol of transaction.Order.OrderLines) {
          await tx.productVariant.update({
            where: { id: ol.variantId },
            data: { stockQty: { increment: ol.qty } }
          });
        }
        // Actualizar transacción
        await tx.transaction.update({
          where: { id: transactionId },
          data: { status: status, payload: { externalId, note: "Provider rejected/expired payment" } }
        });
        // Actualizar orden
        await tx.order.update({
          where: { id: transaction.orderId },
          data: { status: status === 'FAILED' ? 'PAYMENT_FAILED' : 'PAYMENT_EXPIRED' }
        });
      });

      logPaymentEvent({ level: 'INFO', action: 'WEBHOOK_ROLLBACK_SUCCESS', transactionId, orderId: transaction.orderId, status, message: 'Stock rolled back and order cancelled' });
      return NextResponse.json({ success: true, message: "Payment failed/expired processed, stock rolled back" });
    }

    return NextResponse.json({ error: "Invalid status payload" }, { status: 400 });

  } catch (error: any) {
    logPaymentEvent({ level: 'FATAL', action: 'WEBHOOK_CRITICAL_ERROR', message: error.message });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
