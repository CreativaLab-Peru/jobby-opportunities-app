import "dotenv/config";  // ⬅️ REQUIRED so Prisma loads .env with Bun
import { defineConfig, env } from "prisma/config";

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
