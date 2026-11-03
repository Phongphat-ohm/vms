/**
 * Date and Age calculation utilities
 * Standard Thai civic date processing
 */

/**
 * Calculates current age in full years from a birth date.
 * Accurately compares year, month, and day.
 */
export function calculateAge(birthDate: Date | string): number {
  const dateObj = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  if (isNaN(dateObj.getTime())) {
    return 0;
  }

  const today = new Date();
  let age = today.getFullYear() - dateObj.getFullYear();
  const monthDiff = today.getMonth() - dateObj.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateObj.getDate())) {
    age--;
  }

  return Math.max(0, age);
}

/**
 * Formats a Date object to standard YYYY-MM-DD ISO date string.
 */
export function formatDateOnly(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
}
