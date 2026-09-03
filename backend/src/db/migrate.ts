import { query } from "./index.js";

const migrations = [
  `
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `,
  `
    INSERT INTO messages (content)
    SELECT 'Welcome to your new app!'
    WHERE NOT EXISTS (SELECT 1 FROM messages)
  `,
];

async function migrate() {
  console.log("Running migrations...");

  for (const sql of migrations) {
    await query(sql);
  }

  console.log("Migrations complete.");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
