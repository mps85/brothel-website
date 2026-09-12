import { query } from "./index.js";

const migrations = [
  `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `,
  `
    DROP TABLE IF EXISTS messages
  `,
  `
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey
  `,
  `
    ALTER TABLE users DROP COLUMN IF EXISTS id
  `,
  `
    DROP SEQUENCE IF EXISTS users_id_seq
  `,
`
    ALTER TABLE users ADD PRIMARY KEY (username)
  `,
  `
    CREATE TABLE messages (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL REFERENCES users(username),
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    )
  `,
  `
    INSERT INTO roles (name)
    SELECT 'admin'
    WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'admin')
  `,
  `
    CREATE TABLE IF NOT EXISTS user_roles (
      user_username TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
      role_name TEXT NOT NULL REFERENCES roles(name) ON DELETE CASCADE,
      PRIMARY KEY (user_username, role_name)
    )
  `,
  `
    INSERT INTO user_roles (user_username, role_name)
    SELECT username, 'admin'
    FROM users
    WHERE username = 'admin'
    ON CONFLICT DO NOTHING
  `,
  `
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      username TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
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
