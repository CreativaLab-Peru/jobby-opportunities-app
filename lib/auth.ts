import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { ObjectId } from "mongodb";

function getTrustedOrigins() {
  const envOrigins = [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") || []).map((origin) => origin.trim()),
  ].filter(Boolean) as string[];

  if (process.env.NODE_ENV === "production") {
    return Array.from(new Set(envOrigins));
  }

  const defaults = [
    "http://localhost:3000",
    "http://localhost:4000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:4000",
  ];

  return Array.from(new Set([...envOrigins, ...defaults]));
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { 
    provider: "mongodb"
  }),
  emailAndPassword: { 
    enabled: true 
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  trustedOrigins: getTrustedOrigins(),
  advanced: {
    database: {
      generateId: () => new ObjectId().toString()
    }
  }
});