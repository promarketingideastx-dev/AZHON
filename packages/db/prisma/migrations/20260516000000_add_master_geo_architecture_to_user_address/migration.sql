ALTER TABLE "UserAddress"
ADD COLUMN "cityCode" TEXT,
ADD COLUMN "departmentCode" TEXT,
ADD COLUMN "citySource" TEXT DEFAULT 'catalog',
ADD COLUMN "cityNameRaw" TEXT,
ADD COLUMN "geoStatus" TEXT DEFAULT 'pending_review',
ADD COLUMN "coverageStatus" TEXT DEFAULT 'pending_review',
ADD COLUMN "deliveryEligibility" TEXT DEFAULT 'pending_review',
ADD COLUMN "addressSource" TEXT DEFAULT 'user_selected',
ADD COLUMN "gpsRequiredLater" BOOLEAN NOT NULL DEFAULT false;
