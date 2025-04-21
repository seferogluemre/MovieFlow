/**
 * Generates a random 6-digit verification code.
 * This is used for email verification during user registration.
 * @returns A string containing a 6-digit code
 */
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Validates whether a provided code matches the expected format of a verification code.
 * @param code The code to validate
 * @returns Boolean indicating if the code is valid
 */
export const isValidVerificationCode = (code: string): boolean => {
  // Ensure it's exactly 6 digits
  return /^\d{6}$/.test(code);
};

/**
 * Creates a verification data object with expiration time
 * @param code The verification code
 * @param expirationHours Number of hours until expiration (default: 12)
 * @returns Object containing code and expiration date
 */
export const createVerificationData = (code: string, expirationHours = 12) => {
  const expirationTime = new Date();
  expirationTime.setHours(expirationTime.getHours() + expirationHours);

  return {
    code,
    expires: expirationTime,
  };
};
