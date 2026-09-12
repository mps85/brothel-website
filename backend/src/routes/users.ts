import { Router } from "express";
import { pool, query } from "../db/index.js";
import { requireRole } from "./auth.js";

const router = Router();

router.get("/", requireRole("admin"), async (_req, res) => {
  const result = await query<{ username: string; email: string; roles: string[] }>(
    `SELECT u.username, u.email,
            ARRAY_REMOVE(ARRAY_AGG(ur.role_name), NULL) AS roles
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_username = u.username
     GROUP BY u.username, u.email
     ORDER BY u.username`
  );
  res.json(result.rows);
});

router.post("/", requireRole("admin"), async (req, res) => {
  const { username, email, password, roles } = req.body;

  if (
    !username || !email || !password ||
    typeof username !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    (roles !== undefined && !Array.isArray(roles))
  ) {
    res.status(400).json({ error: "username, email, and password are required; roles must be an array" });
    return;
  }

  const roleList = roles as string[];
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3)", [
      username,
      email,
      password,
    ]);
    for (const role of roleList) {
      await client.query("INSERT INTO user_roles (user_username, role_name) VALUES ($1, $2)", [
        username,
        role,
      ]);
    }
    await client.query("COMMIT");
    res.status(201).json({ username, email, roles: roleList });
  } catch (err) {
    await client.query("ROLLBACK");
    const pgErr = err as { code?: string };
    if (pgErr.code === "23505") {
      res.status(409).json({ error: "username or email already exists" });
    } else if (pgErr.code === "23503") {
      res.status(400).json({ error: "unknown role" });
    } else {
      res.status(400).json({ error: "could not create user" });
    }
  } finally {
    client.release();
  }
});

router.delete("/:username", requireRole("admin"), async (req, res) => {
  const result = await query("DELETE FROM users WHERE username = $1", [req.params.username]);

  if (result.rowCount === 0) {
    res.status(404).json({ error: "user not found" });
    return;
  }

  res.status(204).end();
});

export default router;