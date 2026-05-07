import crypto from 'crypto';

/**
 * Normalized status mapped from Provider's native status
 */
export type NormalizedStatus = 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'PENDING';

/**
 * Result of webhook normalization
 */
export interface WebhookPayloadNormalized {
  transactionId: string;
  externalId: string;
  status: NormalizedStatus;
  rawPayload: any;
}

/**
 * Base interface for Payment Providers in AZHON
 */
export interface PaymentProvider {
  /**
   * Identificador del proveedor
   */
  readonly providerId: string;

  /**
   * Generates a payment intent token and redirect URL for the client.
   */
  generatePaymentIntent(transactionId: string, amount: number, currency: string): Promise<{ paymentToken: string, paymentUrl: string }>;

  /**
   * Validates the webhook payload signature to ensure authenticity.
   * Throws Error if invalid.
   */
  validateWebhookSignature(payload: any, headers: Record<string, string>): boolean;

  /**
   * Normalizes the provider-specific payload into AZHON standard format
   */
  normalizeWebhookPayload(payload: any): WebhookPayloadNormalized;
}

// ==========================================
// BAC CREDOMATIC HONDURAS ADAPTER
// ==========================================
export class BacHondurasProvider implements PaymentProvider {
  readonly providerId = 'BAC_HN';
  private readonly config = {
    apiKey: process.env.BAC_HN_API_KEY || '',
    hmacSecret: process.env.BAC_HN_HMAC_SECRET || '',
    endpoint: process.env.BAC_HN_ENDPOINT || 'https://sandbox.baccredomatic.com/payment',
    isProduction: process.env.NODE_ENV === 'production'
  };

  private validateConfig() {
    if (!this.config.apiKey || !this.config.hmacSecret) {
      console.warn(`[Config Readiness] BAC_HN lacks mandatory credentials. Sandbox/Fallback might fail.`);
    }
  }

  async generatePaymentIntent(transactionId: string, amount: number, currency: string) {
    this.validateConfig();
    
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signatureBase = `${transactionId}|${amount}|${currency}|${timestamp}`;
    
    let signature = 'mock_bac_signature';
    if (this.config.hmacSecret) {
      signature = crypto.createHmac('sha256', this.config.hmacSecret).update(signatureBase).digest('hex');
    }

    return {
      paymentToken: signature,
      paymentUrl: `/payment-handoff/bac?tx=${transactionId}&amt=${amount}&cur=${currency}&ts=${timestamp}&sig=${signature}`
    };
  }

  validateWebhookSignature(payload: any, headers: Record<string, string>): boolean {
    const signature = headers['x-bac-signature'];
    if (!this.config.hmacSecret) {
      console.warn("[Config Readiness] BAC_HN validateWebhookSignature bypassed due to missing hmacSecret");
      return true; // Bypass temporal en modo Readiness
    }
    if (!signature) return false;

    const expectedBase = `${payload.transactionId}|${payload.amount}|${payload.status}`;
    const expectedSignature = crypto.createHmac('sha256', this.config.hmacSecret).update(expectedBase).digest('hex');
    
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  }

  normalizeWebhookPayload(payload: any): WebhookPayloadNormalized {
    let status: NormalizedStatus = 'FAILED';
    if (payload.status === 'APPROVED' || payload.status === 'SUCCESS') status = 'SUCCESS';
    if (payload.status === 'DECLINED') status = 'FAILED';
    if (payload.status === 'EXPIRED') status = 'EXPIRED';

    return {
      transactionId: payload.transactionId,
      externalId: payload.authorizationCode || payload.externalId || `ext_${Date.now()}`,
      status,
      rawPayload: payload
    };
  }
}

// ==========================================
// PAGADITO HONDURAS ADAPTER
// ==========================================
export class PagaditoHondurasProvider implements PaymentProvider {
  readonly providerId = 'PAGADITO_HN';
  private readonly config = {
    wsk: process.env.PAGADITO_HN_WSK || '',
    uid: process.env.PAGADITO_HN_UID || '',
    endpoint: process.env.PAGADITO_HN_ENDPOINT || 'https://sandbox.pagadito.com/comercios/ws/',
  };

  private validateConfig() {
    if (!this.config.wsk || !this.config.uid) {
      console.warn(`[Config Readiness] PAGADITO_HN lacks mandatory credentials. Sandbox/Fallback might fail.`);
    }
  }

  async generatePaymentIntent(transactionId: string, amount: number, currency: string) {
    this.validateConfig();

    const token = `pg_sess_${transactionId}_${Date.now()}`;
    
    return {
      paymentToken: token,
      paymentUrl: `/payment-handoff/pagadito?token=${token}&tx=${transactionId}`
    };
  }

  validateWebhookSignature(payload: any, headers: Record<string, string>): boolean {
    const signature = headers['x-pagadito-hash'];
    if (!this.config.wsk) {
      console.warn("[Config Readiness] PAGADITO_HN validateWebhookSignature bypassed due to missing WSK");
      return true; // Bypass temporal
    }
    if (!signature) return false;

    const expectedHash = crypto.createHash('md5').update(`${payload.ern}${this.config.wsk}`).digest('hex');
    return signature === expectedHash;
  }

  normalizeWebhookPayload(payload: any): WebhookPayloadNormalized {
    let status: NormalizedStatus = 'FAILED';
    if (payload.status === 'COMPLETED') status = 'SUCCESS';
    if (payload.status === 'CANCELLED') status = 'FAILED';
    if (payload.status === 'REVOKED') status = 'EXPIRED';

    return {
      transactionId: payload.transactionId,
      externalId: payload.ern || `ext_${Date.now()}`, // Earn Reference Number
      status,
      rawPayload: payload
    };
  }
}

// ==========================================
// INTERNAL SANDBOX ADAPTER (TESTING ONLY)
// ==========================================
export class InternalSandboxProvider implements PaymentProvider {
  readonly providerId = 'AZHON_SANDBOX';

  async generatePaymentIntent(transactionId: string, amount: number, currency: string) {
    const token = `dev_token_${transactionId}`;
    return {
      paymentToken: token,
      paymentUrl: `/payment-handoff/sandbox?tx=${transactionId}&token=${token}`
    };
  }

  validateWebhookSignature(payload: any, headers: Record<string, string>): boolean {
    // Modo dev: el frontend enviará una firma mock
    return payload.secret === 'azhon_internal_dev_secret';
  }

  normalizeWebhookPayload(payload: any): WebhookPayloadNormalized {
    return {
      transactionId: payload.transactionId,
      externalId: `sndbx_${Date.now()}`,
      status: payload.status as NormalizedStatus,
      rawPayload: payload
    };
  }
}

export function getPaymentProvider(providerId: string): PaymentProvider {
  switch (providerId) {
    case 'BAC_HN':
      return new BacHondurasProvider();
    case 'PAGADITO_HN':
      return new PagaditoHondurasProvider();
    case 'AZHON_SANDBOX':
      if (process.env.NODE_ENV === 'production') {
        throw new Error("[SECURITY FATAL] Internal Sandbox provider cannot be used in production environment.");
      }
      return new InternalSandboxProvider();
    default:
      throw new Error(`Unsupported payment provider: ${providerId}`);
  }
}
