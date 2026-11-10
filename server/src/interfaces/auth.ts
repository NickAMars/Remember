export interface UserClaims {
  sub: string;
  name: string;
  authType: 'local' | 'google' | 'facebook';
}
