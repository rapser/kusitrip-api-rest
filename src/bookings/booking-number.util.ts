import { randomInt } from 'crypto';

export function generateBookingNumber(): string {
  return `KUSI-${randomInt(100000, 1000000)}`;
}
