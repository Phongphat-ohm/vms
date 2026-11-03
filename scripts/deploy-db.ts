import { execSync } from "child_process";
import "dotenv/config";

/**
 * Village Management System (VMS) - Strict Database Migration, Deployment & Seed Runner
 * 
 * Strict policy: NO `prisma db push`. All schema changes must be applied via `prisma migrate deploy`.
 * 
 * Steps:
 * 1. Verify environment and database URLs (DATABASE_URL & DIRECT_URL)
 * 2. Generate Prisma Client (`prisma generate`)
 * 3. Apply migrations strictly via Prisma Migrate (`prisma migrate deploy`)
 * 4. Run database seed (`prisma/seed.ts`)
 */

function log(step: string, msg: string) {
  console.log(`\x1b[36m[${step}]\x1b[0m ${msg}`);
}

function success(msg: string) {
  console.log(`\x1b[32m✔ ${msg}\x1b[0m`);
}

function error(msg: string) {
  console.error(`\x1b[31m✖ ${msg}\x1b[0m`);
}

async function run() {
  console.log("=================================================");
  console.log("  VMS Strict Database Migration & Deploy Runner");
  console.log("  (Policy: Strict Prisma Migrate - No DB Push)   ");
  console.log("=================================================\n");

  // 1. Verify DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  if (!dbUrl) {
    error("DATABASE_URL is not set in environment or .env file!");
    process.exit(1);
  }
  log("ENV", `Application URL: ${dbUrl.replace(/:[^:@]*@/, ":****@")}`);
  if (directUrl) {
    log("ENV", `Migration Direct URL: ${directUrl.replace(/:[^:@]*@/, ":****@")}`);
  }

  // 2. Prisma Generate
  log("1/3", "Generating Prisma Client (prisma generate)...");
  try {
    execSync("npx prisma generate", { stdio: "inherit" });
    success("Prisma Client generated successfully.");
  } catch (err) {
    error("Failed to generate Prisma Client.");
    process.exit(1);
  }

  // 3. Strict Prisma Migrate Deploy
  log("2/3", "Deploying database migrations strictly (prisma migrate deploy)...");
  try {
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    success("All database migrations deployed and verified successfully.");
  } catch (err) {
    error("Migration deployment failed. Please check error details above.");
    process.exit(1);
  }

  // 4. Seed Database
  log("3/3", "Seeding database with baseline data (prisma/seed.ts)...");
  try {
    execSync("bun run prisma/seed.ts", { stdio: "inherit" });
    success("Database seed completed successfully.");
  } catch (err) {
    try {
      execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
      success("Database seed completed successfully.");
    } catch (fallbackErr) {
      error("Database seeding failed. See error output above.");
      process.exit(1);
    }
  }

  console.log("\n=================================================");
  success("Strict database migration & deployment completed!");
  console.log("=================================================\n");
}

run().catch((e) => {
  error(`Unexpected error: ${e.message}`);
  process.exit(1);
});
