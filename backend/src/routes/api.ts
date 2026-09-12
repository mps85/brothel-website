import crypto from "node:crypto";
import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { pool, query } from "../db/index.js";

const router = Router();

async function getAuthUser(req: Request): Promise<string | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;

  const token = header.slice("Bearer ".length);
  const session = await query<{ username: string }>(
    "SELECT username FROM sessions WHERE token = $1",
    [token]
  );

  return session.rowCount ? session.rows[0].username : null;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  void getAuthUser(req).then((username) => {
    if (!username) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    res.locals.username = username;
    next();
  });
}

function requireRole(role: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const username = await getAuthUser(req);
    if (!username) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    const rolesResult = await query<{ roles: string[] }>(
      `SELECT ARRAY_REMOVE(ARRAY_AGG(ur.role_name), NULL) AS roles
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_username = u.username
       WHERE u.username = $1
       GROUP BY u.username`,
      [username]
    );

    if (!rolesResult.rows[0].roles.includes(role)) {
      res.status(403).json({ error: "forbidden" });
      return;
    }

    res.locals.username = username;
    next();
  };
}

router.get("/health", async (_req, res) => {
  try {
    await query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

router.get("/messages", requireAuth, async (_req, res) => {
  const result = await query<{ id: number; username: string; message: string; created_at: string }>(
    "SELECT id, username, message, created_at FROM messages ORDER BY created_at ASC"
  );
  res.json(result.rows);
});

router.get("/messages/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  if (id === "latest") {
    const result = await query<{ id: number; username: string; message: string; created_at: string }>(
      "SELECT id, username, message, created_at FROM messages ORDER BY id DESC LIMIT 1"
    );
    res.json(result.rows[0] ?? null);
    return;
  }

  const numericId = Number(id);
  if (!Number.isInteger(numericId)) {
    res.status(400).json({ error: "invalid message id" });
    return;
  }

  const result = await query<{ id: number; username: string; message: string; created_at: string }>(
    "SELECT id, username, message, created_at FROM messages WHERE id = $1",
    [numericId]
  );

  if (result.rowCount === 0) {
    res.status(404).json({ error: "message not found" });
    return;
  }

  res.json(result.rows[0]);
});

router.post("/messages", requireAuth, async (req, res) => {
  const username = res.locals.username;
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "message is required" });
    return;
  }

  const result = await query<{ id: number; username: string; message: string; created_at: string }>(
    "INSERT INTO messages (username, message) VALUES ($1, $2) RETURNING id, username, message, created_at",
    [username, message.trim()]
  );

  res.status(201).json(result.rows[0]);
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  // TODO: implement missed login counter
  const result = await query<{ username: string; roles: string[] }>(
    `SELECT u.username,
            ARRAY_REMOVE(ARRAY_AGG(ur.role_name), NULL) AS roles
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_username = u.username
     WHERE u.email = $1 AND u.password = $2
     GROUP BY u.username`,
    [email, password]
  );

  if (result.rowCount === 0) {
    res.status(404).json({ error: "user not found" });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  await query("INSERT INTO sessions (token, username) VALUES ($1, $2)", [
    token,
    result.rows[0].username,
  ]);

  res.status(200).json({ ...result.rows[0], token });
});

router.post("/logout", async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const token = header.slice("Bearer ".length);
  await query("DELETE FROM sessions WHERE token = $1", [token]);
  res.status(204).end();
});

router.get("/users", requireRole("admin"), async (_req, res) => {
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

router.post("/users", requireRole("admin"), async (req, res) => {
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

router.delete("/users/:username", requireRole("admin"), async (req, res) => {
  const result = await query("DELETE FROM users WHERE username = $1", [req.params.username]);

  if (result.rowCount === 0) {
    res.status(404).json({ error: "user not found" });
    return;
  }

  res.status(204).end();
});

export default router;