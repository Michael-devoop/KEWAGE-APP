const PHONE_EMAIL_DOMAIN = "phone.skillconnect.app";

export function phoneToEmail(phone: string): string {
  return `${phone.replace(/\D/g, "")}@${PHONE_EMAIL_DOMAIN}`;
}
