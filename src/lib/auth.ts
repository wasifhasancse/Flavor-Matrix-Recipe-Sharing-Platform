import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { validateEnv, requiredEnv } from "./env";

// Validate env vars before bootstrapping
validateEnv();

const client = new MongoClient(requiredEnv.MONGODB_URI!);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
    usePlural: true, // Use pluralized collection names (e.g. users, sessions)
  }),
  baseURL: requiredEnv.BETTER_AUTH_URL,
  secret: requiredEnv.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: requiredEnv.GOOGLE_CLIENT_ID!,
      clientSecret: requiredEnv.GOOGLE_CLIENT_SECRET!,
    },
  },
});
