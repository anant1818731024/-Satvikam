import { setBaseUrl } from "@workspace/api-client-react";

const DEPLOYED_API_BASE_URL = "https://satvikam.onrender.com";

function normalizeApiBaseUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();

  if (!trimmed || trimmed === "/") {
    return null;
  }

  return trimmed.replace(/\/+$/, "");
}

export const API_BASE_URL = normalizeApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? DEPLOYED_API_BASE_URL : ""),
);

export function configureApiClient(): void {
  setBaseUrl(API_BASE_URL);
}
