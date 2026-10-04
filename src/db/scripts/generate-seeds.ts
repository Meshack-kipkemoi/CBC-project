// @/scripts/generate-seeds.ts

import fs from "fs";
import path from "path";

const dir = path.resolve("src/db/seeds");

const files = fs
  .readdirSync(dir)
  .filter((file) => file !== "index.ts" && file.endsWith(".ts"));

/**
 * 1. Generate index.ts (exports)
 */
const exports = files
  .map((file, i) => {
    const name = `seed${i}`;
    return `import ${name} from "./${file.replace(".ts", "")}";`;
  })
  .join("\n");

const runner = `
export const seeders = [
${files.map((_, i) => `  seed${i}`).join(",\n")}
];
`;

fs.writeFileSync(path.join(dir, "index.ts"), `${exports}\n${runner}`);

/**
 * 2. Generate seed.ts runner
 */
const seedFile = `
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
`;

fs.writeFileSync(path.resolve("src/db/seed.ts"), seedFile);

console.log("✅ Seeds generated successfully");
