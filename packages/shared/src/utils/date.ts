export function consentExpiryDate(durationDays: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + durationDays);
  return date;
}

export function formatISODate(date: Date): string {
  return date.toISOString();
}
