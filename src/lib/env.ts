export const requiredEnv = {
  MONGODB_URI: process.env.MONGODB_URI,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
};

export function validateEnv() {
  const missing = Object.entries(requiredEnv)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `[Auth Configuration Error]: Missing required environment variables: ${missing.join(", ")}`
    );
  }
}
