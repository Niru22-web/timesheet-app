import crypto from 'crypto';

// Generate a secure registration token
export const generateRegistrationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Check if a token is expired
export const isTokenExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};

// Create registration token expiry date (configurable duration)
export const createTokenExpiry = (hours = 24): Date => {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
};

// Alternative expiry durations for different use cases
export const createTokenExpiryShort = (): Date => createTokenExpiry(1); // 1 hour
export const createTokenExpiryVeryShort = (): Date => createTokenExpiry(1/12); // 5 minutes
export const createTokenExpiryLong = (): Date => createTokenExpiry(72); // 3 days
