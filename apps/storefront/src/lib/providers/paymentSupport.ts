import { prisma } from '@/lib/prisma';
import { NormalizedStatus } from './paymentFactory';

export interface PaymentTimelineEvent {
  status: string;
  timestamp: Date;
  note?: string;
  actor: 'SYSTEM' | 'USER' | 'PROVIDER' | 'CRON';
}

/**
 * Helper de Observabilidad: Reconstruye la línea de tiempo de pago de una orden.
 * Ayuda al equipo de soporte a ver qué pasó con el Intent y el Callback.
 */
export async function getOrderPaymentTimeline(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      Transactions: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!order) throw new Error("Order not found");

  const timeline: PaymentTimelineEvent[] = [];

  // Creación de la orden
  timeline.push({
    status: 'ORDER_CREATED',
    timestamp: order.createdAt,
    actor: 'USER',
    note: `Order ${order.id} started in AWAITING_PAYMENT`
  });

  // Intentos de pago (Transactions)
  for (const tx of order.Transactions) {
    timeline.push({
      status: `INTENT_CREATED (${tx.providerId})`,
      timestamp: tx.createdAt,
      actor: 'USER',
      note: `Intent ID: ${tx.id}`
    });

    if (tx.status !== 'PENDING') {
      const isExpired = tx.status === 'EXPIRED';
      const isFailed = tx.status === 'FAILED';
      
      let actor: 'SYSTEM' | 'PROVIDER' | 'CRON' = 'PROVIDER';
      if (isExpired && (tx.payload as any)?.note?.includes('sweep')) {
        actor = 'CRON';
      }

      timeline.push({
        status: `INTENT_${tx.status}`,
        timestamp: tx.updatedAt,
        actor,
        note: `Provider Reference: ${(tx.payload as any)?.externalId || 'Unknown'}. Reason: ${(tx.payload as any)?.note || 'N/A'}`
      });
    }
  }

  // Estado final
  if (order.status !== 'AWAITING_PAYMENT') {
    timeline.push({
      status: `ORDER_FINALIZED_${order.status}`,
      timestamp: order.updatedAt,
      actor: 'SYSTEM',
      note: `Final truth state applied to Order`
    });
  }

  return {
    orderId: order.id,
    currentOrderStatus: order.status,
    totalIntents: order.Transactions.length,
    timeline
  };
}

/**
 * Helper de Soporte: Registra un log estructurado (Observability)
 */
export function logPaymentEvent(event: {
  level: 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  action: string;
  orderId?: string;
  transactionId?: string;
  providerId?: string;
  externalId?: string;
  status?: NormalizedStatus;
  message: string;
  rawPayload?: any;
}) {
  const logPayload = {
    timestamp: new Date().toISOString(),
    context: 'PAYMENT_CORE',
    ...event
  };

  // En producción esto iría a Datadog, ELK, Sentry, CloudWatch, etc.
  if (event.level === 'ERROR' || event.level === 'FATAL') {
    console.error(JSON.stringify(logPayload));
  } else {
    console.log(JSON.stringify(logPayload));
  }
}
