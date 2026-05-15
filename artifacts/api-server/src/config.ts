const rawFrontendOrigin = process.env.FRONTEND_ORIGIN?.trim();

export const config = {
  frontendOrigin: rawFrontendOrigin || null,
  isProduction: process.env.NODE_ENV === "production",
};

export const corsOrigin = config.frontendOrigin || true;

export const sessionCookie = {
  secure: config.isProduction,
  sameSite: config.isProduction && config.frontendOrigin ? "none" : config.isProduction ? "strict" : "lax",
} as const;
