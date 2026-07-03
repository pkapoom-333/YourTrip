-- CreateTable
CREATE TABLE "site_configs" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_configs_pkey" PRIMARY KEY ("key")
);

-- Seed default config
INSERT INTO "site_configs" ("key", "value", "updatedAt") VALUES
  ('siteName', 'Your Trip', NOW()),
  ('siteDescription', 'สังคมแห่งการท่องเที่ยว', NOW()),
  ('autoHideReportThreshold', '5', NOW()),
  ('maxFeaturedPlaces', '10', NOW()),
  ('allowNewRegistrations', 'true', NOW()),
  ('maintenanceMode', 'false', NOW()),
  ('maintenanceMessage', 'ขณะนี้ระบบอยู่ระหว่างการปรับปรุง กรุณากลับมาใหม่ภายหลัง', NOW()),
  ('postsPerPage', '20', NOW()),
  ('maxImageSizeMB', '10', NOW()),
  ('allowedImageTypes', 'image/jpeg,image/png,image/webp', NOW()),
  ('guideApplicationOpen', 'true', NOW()),
  ('contactEmail', 'pakpoomtee24@gmail.com', NOW()),
  ('socialInstagram', '', NOW()),
  ('socialFacebook', '', NOW()),
  ('socialTwitter', '', NOW())
ON CONFLICT ("key") DO NOTHING;
