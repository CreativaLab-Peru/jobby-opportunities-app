import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { ObjectId } from "mongodb";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { 
    provider: "mongodb"
  }),
  emailAndPassword: { 
    enabled: true 
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  trustedOrigins: [
    process.env.BETTER_AUTH_URL!
  ],
  advanced: {
    database: {
      generateId: () => new ObjectId().toString()
    }
  }
});