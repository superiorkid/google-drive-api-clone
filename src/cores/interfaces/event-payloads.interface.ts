export interface EventPayloads {
  'user.welcome': { username: string; email: string };
  'user.resetPassword': { username: string; email: string; resetLink: string };
  'user.verifyEmail': { username: string; email: string; verifyLink: string };
}
