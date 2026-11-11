export interface UserClaims {
  /** The user's uuid. */
  sub: string;
  name: string;
  authType: 'local';
  // Google and Facebook sign-in are turned off. Put them back here if they return:
  // authType: 'local' | 'google' | 'facebook';
}
