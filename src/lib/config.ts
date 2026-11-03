/**
 * Village Management System (VMS) - Centralized Environment & Configuration Module
 * 
 * Provides validated configuration values for both server and client domains.
 * Uses the latest Supabase architecture:
 * - Publishable Key (sb_pub_...) for public/client operations
 * - Secret Key (sb_sec_...) for server/admin operations
 */

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "http://localhost:8000";

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "";

// -------------------------------------------------------------
// 1. Server Configuration (Protected Secrets & Infrastructure)
// -------------------------------------------------------------

export const serverConfig = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://vms_admin:secure_vms_password_2026@localhost:5432/vms_db?schema=public",

  // Modern Supabase Client Credentials
  supabaseUrl,
  supabasePublishableKey,
  supabaseSecretKey,

  // Derived Storage & Auth Endpoints (No manual separate URLs required)
  get supabaseAuthUrl(): string {
    return process.env.SUPABASE_AUTH_URL || `${supabaseUrl}/auth/v1`;
  },
  get supabaseStorageUrl(): string {
    return process.env.SUPABASE_STORAGE_URL || `${supabaseUrl}/storage/v1`;
  },
  storageBucketName: process.env.STORAGE_BUCKET_NAME || "village-documents",
  storageSignedUrlExpiry: Number(process.env.STORAGE_SIGNED_URL_EXPIRY || 300), // 5 minutes
  storageMaxFileSizeBytes: Number(process.env.STORAGE_MAX_FILE_SIZE_BYTES || 52428800), // 50MB

  // Cryptographic Secrets for PDPA
  fieldEncryptionKey:
    process.env.FIELD_ENCRYPTION_KEY ||
    "c8a143f29b43e8d91b72a0f589c3e4125b74109865c3de2f7a94b15093e82b71",
  blindIndexPepper:
    process.env.BLIND_INDEX_PEPPER ||
    "vms-production-grade-blind-index-pepper-seed-2026",

  // Session & Auth (Falls back safely to Supabase Secret Key if unset)
  jwtSecret:
    process.env.JWT_SECRET ||
    supabaseSecretKey ||
    "vms-super-secret-jwt-signing-key-production-grade-2026",
  sessionCookieName: process.env.SESSION_COOKIE_NAME || "vms_session",
  sessionMaxAgeSeconds: Number(process.env.SESSION_MAX_AGE_SECONDS || 86400),

  // Default Tenancy & Initial Bootstrap
  defaultVillageId:
    process.env.DEFAULT_VILLAGE_ID || "11111111-1111-1111-1111-111111111111",
  initialAdminEmail: process.env.INITIAL_ADMIN_EMAIL || "admin@village.local",
};

// -------------------------------------------------------------
// 2. Public / Client Configuration (Safe for UI and Browsers)
// -------------------------------------------------------------

export const publicConfig = {
  appName:
    process.env.NEXT_PUBLIC_APP_NAME ||
    "ระบบบริหารหมู่บ้านอัจฉริยะ (Smart Village Management System - VMS)",
  appShortName: process.env.NEXT_PUBLIC_APP_SHORT_NAME || "ระบบบริหารหมู่บ้านอัจฉริยะ (VMS)",
  siteUrl: process.env.NEXT_PUBLIC_APP_SITE_URL || "http://localhost:3000",

  // Modern Supabase Client Credentials (Safe for browser)
  supabaseUrl,
  supabasePublishableKey,

  // -------------------------------------------------------------
  // ข้อกำหนดสถาปัตยกรรมข้อมูล (Data Architecture Principle):
  // ข้อมูลหมู่บ้าน (ชื่อ, รหัส, หมู่, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์, เบอร์โทร)
  // และข้อมูลผู้ใช้งาน เป็นข้อมูลเชิงธุรกิจที่จัดเก็บและตั้งค่าในฐานข้อมูล PostgreSQL
  // (ตาราง Village, VillageSetting, User) ทั้งหมด ไม่ต้องตั้งค่าในไฟล์ .env
  //
  // ค่าคงที่ด้านล่างเป็นเพียง Fallback สำรองฉุกเฉินตอนเริ่มต้นระบบ ก่อนที่ข้อมูลจริง
  // จะถูกโหลดจากฐานข้อมูลผ่าน useVillage() และ Server Actions
  // -------------------------------------------------------------
  defaultVillage: {
    name: "บ้านหนองหญ้าขาว",
    code: "VIL-7006-03",
    moo: 3,
    subdistrict: "ดอนทราย",
    district: "ปากท่อ",
    province: "ราชบุรี",
    postalCode: "70140",
    phone: "032-123456",
    get fullAddress(): string {
      return `${this.name} (หมู่ ${this.moo} ต.${this.subdistrict} อ.${this.district} จ.${this.province} ${this.postalCode})`;
    },
    get shortBadge(): string {
      return `${this.name} ม.${this.moo}`;
    },
  },

  defaultOfficer: {
    name: "เจ้าหน้าที่ปฏิบัติการ",
    role: "เจ้าหน้าที่",
    initials: "จน",
  },
};
