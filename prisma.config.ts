import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load .env.local file
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",

  // you can remove migrations for MongoDB since it's not used
  migrations: {
    path: "prisma/migrations",
  },

  engine: "classic",

  datasource: {
    url: env("DATABASE_URL"),
  },
});
