// src/db/seed/create-users.ts
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
  throw new Error("Supabase env vars are missing from environment");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export const USERS_SEED_FILE = "src/db/seeds/.auth-user-ids.json";

export const users = [
  {
    role: "principal",
    email: "principal@mwangaza.sc.ke",
    password: "password123",
    fullName: "Grace Mutua",
    phone: "+254700000001",
  },
  {
    role: "teacher",
    email: "teacher@mwangaza.sc.ke",
    password: "password123",
    fullName: "David Ochieng",
    phone: "+254700000002",
  },
  {
    role: "parent",
    email: "parent@mwangaza.sc.ke",
    password: "password123",
    fullName: "Sarah Wanjiku",
    phone: "+254700000003",
  },
] as const;

export default async function seed() {
  const ids: Record<string, string> = {};

  for (const user of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.fullName,
        phone: user.phone,
      },
    });

    if (error) {
      if (error.message.includes("already been registered")) {
        const { data: list, error: listError } =
          await supabase.auth.admin.listUsers();

        if (listError) {
          throw listError;
        }

        const existing = list.users.find(
          (existingUser) => existingUser.email === user.email,
        );

        if (!existing) {
          throw new Error(
            `User ${user.email} already exists, but could not be retrieved`,
          );
        }

        ids[user.role] = existing.id;

        console.log(`⏭️ ${user.email} already exists`);
        continue;
      }

      throw error;
    }

    ids[user.role] = data.user.id;

    console.log(`✅ Created ${user.email}`);
  }

  // Ensure the destination directory exists.
  const idsPath = path.resolve(USERS_SEED_FILE);

  fs.mkdirSync(path.dirname(idsPath), { recursive: true });

  // Save IDs using role names as keys.
  fs.writeFileSync(idsPath, JSON.stringify(ids, null, 2));

  console.log("✅ User IDs saved");
}
