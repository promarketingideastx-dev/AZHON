/**
 * AZHON SELLER INTELLIGENCE HOOKS
 * 
 * Future-ready event hooks for operational metrics.
 * 
 * Rules:
 * - Emitted synchronously or via Vercel Background functions.
 * - No complex queues yet (Phase 2).
 * - Only emit REAL signals.
 */

// 1. PRODUCT VISIBILITY EVENTS
// --------------------------------------------------
// Emitted when a user visits the PDP.
// Hook point: src/app/[country]/producto/[id]/page.tsx
export const trackProductView = async (productId: string, buyerId?: string) => {
  // TODO: Increment ProductMetric.views
};

// Emitted when a user adds a product to favorites.
export const trackProductFavorite = async (productId: string, buyerId: string) => {
  // TODO: Increment ProductMetric.favorites
};

// 2. PRODUCT TRANSACTION EVENTS
// --------------------------------------------------
// Emitted when an order transitions to PAID.
// Hook point: src/app/api/webhooks/payment/route.ts
export const trackProductSale = async (productId: string, quantity: number) => {
  // TODO: Increment ProductMetric.salesCount by quantity
};

// 3. CATALOG LIFECYCLE EVENTS
// --------------------------------------------------
// Emitted when a product enters IN_REVIEW.
// Hook point: src/app/[country]/vendedor/productos/[id]/actions.ts
export const trackProductReviewRequested = async (productId: string) => {
  // TODO: Send notification to admins
};

// Emitted when a product is REJECTED.
// Hook point: src/app/[country]/admin/productos/revision/page.tsx
export const trackProductRejected = async (productId: string, reason: string) => {
  // TODO: Notify seller with reason
};
