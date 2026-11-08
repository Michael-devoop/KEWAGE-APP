export interface SmsMessage {
  to: string;
  template: "offer" | "assignment" | "expiry";
  data: Record<string, string>;
}

export interface SmsProvider {
  send(message: SmsMessage): Promise<{ providerId: string }>;
}

const mask = (phone: string) => `${phone.slice(0, 4)}****${phone.slice(-2)}`;

/**
 * Development provider. Real providers (Twilio / local aggregator) must replace
 * this behind the same interface. Delivery status never proves a message was read.
 */
export const consoleSmsProvider: SmsProvider = {
  async send({ to, template, data }) {
    const providerId = `console_${Date.now().toString(36)}`;
    console.info(`[sms:${template}] to=${mask(to)} data=${JSON.stringify(data)}`);
    return { providerId };
  },
};

let provider: SmsProvider = consoleSmsProvider;

export function setSmsProvider(next: SmsProvider): void {
  provider = next;
}

export function getSmsProvider(): SmsProvider {
  return provider;
}
