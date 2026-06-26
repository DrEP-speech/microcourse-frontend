export type PublicEnv = {
  NEXT_PUBLIC_API_BASE_URL: string;
  NEXT_PUBLIC_APP_NAME: string;
  NEXT_PUBLIC_APP_VERSION: string;
};

function required(name: keyof PublicEnv): string {
  const v = process.env[name];
  if (!v || v.trim().length === 0) {
    throw new Error(`[env] Missing required env var: ${name}`);
  }
  return v.trim();
}

/**
 * Client-safe public env.
 * - Uses NEXT_PUBLIC_* variables only.
 * - Throws early (during import) when required vars are missing.
 */
export const env: PublicEnv = {
  NEXT_PUBLIC_API_BASE_URL: required("NEXT_PUBLIC_API_BASE_URL"),
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME?.trim() || "MicroCourse",
  NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION?.trim() || "0.0.0",
};
