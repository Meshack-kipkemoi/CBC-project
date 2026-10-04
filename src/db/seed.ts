
import { seeders } from "./seeds";

async function main() {
  console.log("🚀 Starting database seeding...");

  for (const seed of seeders) {
    await seed();
  }

  console.log("✅ All seeds completed");
  process.exit(0);
}

main();
