// @/index.ts

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from environment variables");
}

// Reuse the client across Next.js development HMR reloads.
const globalForDb = globalThis as unknown as {
  client?: postgres.Sql;
};

const client =
  globalForDb.client ??
  postgres(process.env.DATABASE_URL, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: "require",
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client;
}

export const db = drizzle({ client });
