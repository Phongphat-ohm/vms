/**
 * Thai National ID and Phone Number Formatting Utilities
 * Standard Thai civic formatting guidelines
 */

/**
 * Strips all non-digit characters
 */
export function cleanDigits(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

/**
 * Formats a Thai National ID (13 digits) into standard Thai format:
 * X-XXXX-XXXXX-XX-X (1-4-5-2-1)
 * Supports live formatting as the user types.
 */
export function formatThaiNationalId(value: string | null | undefined): string {
  const digits = cleanDigits(value).slice(0, 13);
  if (!digits) return "";

  if (digits.length <= 1) {
    return digits;
  }
  if (digits.length <= 5) {
    return `${digits[0]}-${digits.slice(1)}`;
  }
  if (digits.length <= 10) {
    return `${digits[0]}-${digits.slice(1, 5)}-${digits.slice(5)}`;
  }
  if (digits.length <= 12) {
    return `${digits[0]}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10)}`;
  }
  return `${digits[0]}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits[12]}`;
}

/**
 * Formats a Thai Phone Number into standard Thai format:
 * - Mobile (10 digits): 0XX-XXX-XXXX (3-3-4)
 * - Bangkok Landline (9 digits, starts with 02): 02-XXX-XXXX (2-3-4)
 * - Provincial Landline (9 digits): 0XX-XXX-XXX (3-3-3)
 * Supports live formatting as the user types.
 */
export function formatThaiPhoneNumber(value: string | null | undefined): string {
  const digits = cleanDigits(value).slice(0, 10);
  if (!digits) return "";

  // Landline 02 (Bangkok & perimeter - 9 digits)
  if (digits.startsWith("02")) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5, 9)}`;
  }

  // Provincial landline (9 digits starting with 03x, 04x, 05x, 07x)
  if (digits.length === 9 && digits.startsWith("0")) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}`;
  }

  // Mobile numbers (06x, 08x, 09x or general 10-digit mobile)
  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

/**
 * Mask Thai National ID according to PDPA standards:
 * X-XXXX-XXXXX-XX-X -> 1-XXXX-XXXXX-12-3 (Preserves 1st, 11th-12th, and check digit)
 */
export function maskThaiNationalId(value: string | null | undefined): string {
  const digits = cleanDigits(value);
  if (digits.length !== 13) {
    return "X-XXXX-XXXXX-XX-X";
  }

  return `${digits[0]}-XXXX-XXXXX-${digits.slice(10, 12)}-${digits[12]}`;
}

/**
 * Formats byte size into human-readable unit (B, KB, MB, GB).
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
