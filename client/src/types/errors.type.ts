export interface NextRedirectError extends Error {
  digest: string;
  mutableCookies?: Record<string, unknown>;
}
