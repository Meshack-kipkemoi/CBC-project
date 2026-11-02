// src/db/seed/01-users.ts
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

export type SeedUser = {
  /** Unique key used in the ids JSON file (several users can share a role). */
  key: string;
  /** Which row in the `roles` table this user maps to. */
  role: "principal" | "teacher" | "parent";
  email: string;
  password: string;
  fullName: string;
  phone: string;
};

// ---------------------------------------------------------------------------
// Staff
//
// One subject teacher per learning area (11 learning areas, including the
// three Religious Education variants). The `key` values are referenced by
// SUBJECTS in 02-seed.ts, so keep them in sync.
// ---------------------------------------------------------------------------

const PASSWORD = "password123";

const staff: SeedUser[] = [
  {
    key: "principal",
    role: "principal",
    email: "principal@mwangaza.sc.ke",
    password: PASSWORD,
    fullName: "Grace Mutua",
    phone: "+254700000001",
  },
  // Mathematics + class teacher of Grade 7 East
  {
    key: "teacher",
    role: "teacher",
    email: "teacher@mwangaza.sc.ke",
    password: PASSWORD,
    fullName: "David Ochieng",
    phone: "+254700000002",
  },
  // English + class teacher of Grade 7 West
  {
    key: "teacher_english",
    role: "teacher",
    email: "teacher.english@mwangaza.sc.ke",
    password: PASSWORD,
    fullName: "Janet Achieng",
    phone: "+254700000004",
  },
  // Integrated Science
  {
    key: "teacher_science",
    role: "teacher",
    email: "teacher.science@mwangaza.sc.ke",
    password: PASSWORD,
    fullName: "Peter Kimani",
    phone: "+254700000005",
  },
  // Kiswahili
  {
    key: "teacher_kiswahili",
    role: "teacher",
    email: "teacher.kiswahili@mwangaza.sc.ke",
    password: PASSWORD,
    fullName: "Juma Hamisi",
    phone: "+254700000006",
  },
  // Social Studies
  {
    key: "teacher_social",
    role: "teacher",
    email: "teacher.social@mwangaza.sc.ke",
    password: PASSWORD,
    fullName: "Esther Nekesa",
    phone: "+254700000007",
  },
  // Pre-Technical Studies
  {
    key: "teacher_pretech",
    role: "teacher",
    email: "teacher.pretech@mwangaza.sc.ke",
    password: PASSWORD,
    fullName: "Samuel Rotich",
    phone: "+254700000008",
  },
  // Agriculture
  {
    key: "teacher_agriculture",
    role: "teacher",
    email: "teacher.agriculture@mwangaza.sc.ke",
    password: PASSWORD,
    fullName: "Lucy Wairimu",
    phone: "+254700000009",
  },
  // Creative Arts & Sports
  {
    key: "teacher_arts",
    role: "teacher",
    email: "teacher.arts@mwangaza.sc.ke",
    password: PASSWORD,
    fullName: "Brian Odhiambo",
    phone: "+254700000010",
  },
  // Christian Religious Education
  {
    key: "teacher_cre",
    role: "teacher",
    email: "teacher.cre@mwangaza.sc.ke",
    password: PASSWORD,
    fullName: "Mary Njeri",
    phone: "+254700000011",
  },
  // Islamic Religious Education
  {
    key: "teacher_ire",
    role: "teacher",
    email: "teacher.ire@mwangaza.sc.ke",
    password: PASSWORD,
    fullName: "Amina Hussein",
    phone: "+254700000012",
  },
  // Hindu Religious Education
  {
    key: "teacher_hre",
    role: "teacher",
    email: "teacher.hre@mwangaza.sc.ke",
    password: PASSWORD,
    fullName: "Rakesh Patel",
    phone: "+254700000013",
  },
];

// ---------------------------------------------------------------------------
// Parents
// ---------------------------------------------------------------------------

// Fewer parents than students, so some parents have two children at the school.
export const PARENT_COUNT = 30;

const PARENT_FIRST_NAMES = [
  "Sarah",
  "Joseph",
  "Agnes",
  "Moses",
  "Margaret",
  "Daniel",
  "Jane",
  "Patrick",
  "Ruth",
  "James",
  "Josephine",
  "Stephen",
  "Monica",
  "George",
  "Anne",
  "Charles",
  "Catherine",
  "Francis",
  "Lydia",
  "Paul",
  "Elizabeth",
  "John",
  "Susan",
  "Joel",
  "Alice",
  "Simon",
  "Millicent",
  "Benson",
  "Pauline",
  "Isaac",
];

const PARENT_LAST_NAMES = [
  "Wanjiku",
  "Akinyi",
  "Kamau",
  "Njeri",
  "Otieno",
  "Mwangi",
  "Wafula",
  "Chebet",
  "Mutua",
  "Kilonzo",
  "Omondi",
  "Adhiambo",
  "Kimani",
  "Waweru",
  "Maina",
  "Nyambura",
  "Karanja",
  "Muriuki",
  "Onyango",
  "Achieng",
  "Barasa",
  "Nekesa",
  "Kipkorir",
  "Mbugua",
  "Gathoni",
  "Odhiambo",
  "Juma",
  "Ndungu",
  "Wekesa",
];

const pad = (n: number) => String(n).padStart(2, "0");

const parents: SeedUser[] = Array.from({ length: PARENT_COUNT }, (_, idx) => {
  const n = idx + 1;

  // Parent #1 keeps the original fixed account (parent@mwangaza.sc.ke).
  if (n === 1) {
    return {
      key: "parent",
      role: "parent" as const,
      email: "parent@mwangaza.sc.ke",
      password: PASSWORD,
      fullName: "Sarah Wanjiku",
      phone: "+254700000003",
    };
  }

  // 30 first names and 29 last names are coprime, so no two parents share a
  // full name.
  return {
    key: `parent_${pad(n)}`,
    role: "parent" as const,
    email: `parent${pad(n)}@mwangaza.sc.ke`,
    password: PASSWORD,
    fullName: `${PARENT_FIRST_NAMES[n % PARENT_FIRST_NAMES.length]} ${
      PARENT_LAST_NAMES[n % PARENT_LAST_NAMES.length]
    }`,
    phone: `+254701${String(n).padStart(6, "0")}`,
  };
});

export const users: SeedUser[] = [...staff, ...parents];

// ---------------------------------------------------------------------------
// Seeder
// ---------------------------------------------------------------------------

export default async function seed() {
  const ids: Record<string, string> = {};

  // Loaded once, only if we hit an "already registered" error.
  let existingUsers: { id: string; email?: string }[] | null = null;

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
        if (!existingUsers) {
          const { data: list, error: listError } =
            await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

          if (listError) {
            throw listError;
          }
          existingUsers = list.users;
        }

        const existing = existingUsers.find((u) => u.email === user.email);

        if (!existing) {
          throw new Error(
            `User ${user.email} already exists, but could not be retrieved`,
          );
        }

        ids[user.key] = existing.id;

        console.log(`⏭️ ${user.email} already exists`);
        continue;
      }

      throw error;
    }

    ids[user.key] = data.user.id;

    console.log(`✅ Created ${user.email}`);
  }

  // Ensure the destination directory exists.
  const idsPath = path.resolve(USERS_SEED_FILE);

  fs.mkdirSync(path.dirname(idsPath), { recursive: true });

  // Save IDs using each user's unique key.
  fs.writeFileSync(idsPath, JSON.stringify(ids, null, 2));

  console.log(`✅ ${users.length} user IDs saved`);
}
