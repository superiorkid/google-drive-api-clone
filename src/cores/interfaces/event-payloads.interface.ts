export interface EventPayloads {
  'user.welcome': { username: string; email: string };
  'user.resetPassword': { username: string; email: string; link: string };
  'user.verifyEmail': { username: string; email: string; link: string };
}
