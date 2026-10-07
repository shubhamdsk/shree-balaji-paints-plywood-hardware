export const MIN_PASSWORD_LENGTH = 10;
export const MAX_PASSWORD_LENGTH = 200;

export interface PasswordChangeInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type PasswordChangeErrors = Partial<Record<keyof PasswordChangeInput, string>>;

export function validatePasswordChange(input: PasswordChangeInput): PasswordChangeErrors {
  const errors: PasswordChangeErrors = {};
  if (!input.currentPassword) errors.currentPassword = "Enter your current password";

  if (input.newPassword.length < MIN_PASSWORD_LENGTH) {
    errors.newPassword = `Use at least ${MIN_PASSWORD_LENGTH} characters`;
  } else if (input.newPassword.length > MAX_PASSWORD_LENGTH) {
    errors.newPassword = `Use at most ${MAX_PASSWORD_LENGTH} characters`;
  } else if (input.newPassword === input.currentPassword) {
    errors.newPassword = "Choose a password different from the current one";
  } else if (input.confirmPassword !== input.newPassword) {
    errors.confirmPassword = "The two new passwords don't match";
  }
  return errors;
}
