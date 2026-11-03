import pg from "pg";
import crypto from "crypto";
import fs from "fs";
import "dotenv/config";

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("No database URL provided in environment!");
  }

  const client = new pg.Client({ connectionString: dbUrl });
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id"                  VARCHAR(36) PRIMARY KEY NOT NULL,
      "checksum"            VARCHAR(64) NOT NULL,
      "finished_at"         TIMESTAMPTZ,
      "migration_name"      VARCHAR(255) NOT NULL,
      "logs"                TEXT,
      "rolled_back_at"      TIMESTAMPTZ,
      "started_at"          TIMESTAMPTZ NOT NULL DEFAULT now(),
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    );
  `);

  const migrationPath = "prisma/migrations/20261102000000_init/migration.sql";
  const migrationSql = fs.readFileSync(migrationPath, "utf8");
  const checksum = crypto.createHash("sha256").update(migrationSql).digest("hex");
  const migrationName = "20261102000000_init";

  const existing = await client.query(
    `SELECT id FROM "_prisma_migrations" WHERE "migration_name" = $1`,
    [migrationName]
  );

  if (existing.rows.length === 0) {
    await client.query(
      `INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "applied_steps_count")
       VALUES ($1, $2, now(), $3, 1)`,
      [crypto.randomUUID(), checksum, migrationName]
    );
    console.log(`✔ Baseline migration "${migrationName}" recorded in _prisma_migrations.`);
  } else {
    console.log(`ℹ Migration "${migrationName}" already recorded.`);
  }

  await client.end();
}

main().catch((err) => {
  console.error("Baseline error:", err);
  process.exit(1);
});
