-- AlterTable
ALTER TABLE "users" ADD COLUMN     "pin_failed_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pin_locked_until" TIMESTAMPTZ,
ADD COLUMN     "security_pin_hash" VARCHAR(255),
ADD COLUMN     "security_pin_salt" VARCHAR(64);
