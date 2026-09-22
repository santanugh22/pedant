import crypto from 'crypto';

export function generateReferralCode(prefix = 'REF'): string {
  const bytes = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}${bytes}`;
}
