import { MIN_PASSWORD_LENGTH, USERNAME_PATTERN } from '../../../constance';

/** Check the sign-up form. Returns an error message, or '' when it is fine. */
export function validateRegistration(username, password) {
  if (!USERNAME_PATTERN.test(username.trim())) {
    return 'Username must be 3 to 32 letters, numbers, ".", "-" or "_"';
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return '';
}
