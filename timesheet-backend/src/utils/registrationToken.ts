import crypto from 'crypto';

// Generate a secure registration token
export const generateRegistrationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Check if a token is expired
export const isTokenExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};

// Create registration token expiry date (24 hours from now)
export const createTokenExpiry = (): Date => {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  return expiry;
};
