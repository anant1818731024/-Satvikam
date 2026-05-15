const rawFrontendOrigin = process.env.FRONTEND_ORIGIN?.trim();
const rawCookieSecure = process.env.SESSION_COOKIE_SECURE?.trim().toLowerCase();
const rawCookieSameSite = process.env.SESSION_COOKIE_SAMESITE?.trim().toLowerCase();

function parseCookieSecure(): boolean {
  if (rawCookieSecure === "true") return true;
  if (rawCookieSecure === "false") return false;
  return process.env.NODE_ENV === "production";
}

function parseCookieSameSite(): "lax" | "strict" | "none" {
  if (rawCookieSameSite === "lax" || rawCookieSameSite === "strict" || rawCookieSameSite === "none") {
    return rawCookieSameSite;
  }

  return process.env.NODE_ENV === "production" ? "none" : "lax";
}

export const config = {
  frontendOrigin: rawFrontendOrigin || null,
  isProduction: process.env.NODE_ENV === "production",
};

export const corsOrigin = config.frontendOrigin || true;

export const sessionCookie = {
  secure: parseCookieSecure(),
  sameSite: parseCookieSameSite(),
} as const;
