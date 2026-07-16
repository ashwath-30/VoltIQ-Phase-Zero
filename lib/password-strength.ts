/**
 * Returns a specific error message if the password doesn't meet the
 * minimum bar, or null if it's fine. Kept as a single shared function
 * so the rule is defined once, not copy-pasted everywhere a password
 * gets set.
 */
export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (!/[a-zA-Z]/.test(password)) {
    return "Password must include at least one letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must include at least one number.";
  }
  return null;
}
