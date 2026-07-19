import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { requiredEnv, validateEnv } from "./env";

// Validate env vars before bootstrapping
validateEnv();

export const client = new MongoClient(requiredEnv.MONGODB_URI!);
export const db = client.db(process.env.MONGODB_DATABASE_NAME);

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
    usePlural: true, // Use pluralized collection names (e.g. users, sessions)
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        input: false,
        defaultValue: "user",
      },
      isBlocked: {
        type: "boolean",
        required: false,
        input: false,
        defaultValue: false,
      },
      isPremium: {
        type: "boolean",
        required: false,
        input: false,
        defaultValue: false,
      },
    },
  },
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
