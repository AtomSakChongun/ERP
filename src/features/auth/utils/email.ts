export const COMPANY_DOMAIN = "sirisoft.co.th";

/** Returns the problem with a company email, or undefined when it is usable. */
export function validateCompanyEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return "Enter your company email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return `Enter a full email, like name@${COMPANY_DOMAIN}.`;
  if (!email.toLowerCase().endsWith(`@${COMPANY_DOMAIN}`)) return `Use your @${COMPANY_DOMAIN} company email.`;
  return undefined;
}
