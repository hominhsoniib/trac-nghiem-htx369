import fs from "fs";
import path from "path";
import { pool } from "./pool";

async function run() {
  const dir = path.join(__dirname, "migrations");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename    TEXT PRIMARY KEY,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  const { rows } = await pool.query<{ filename: string }>("SELECT filename FROM schema_migrations");
  const applied = new Set(rows.map((r) => r.filename));

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip (already applied): ${file}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    console.log(`applying: ${file}`);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  console.log("Migrations complete.");
  await pool.end();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
