import crypto from "node:crypto";
import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { query } from "../db/index.js";

const router = Router();

export async function getAuthUser(req: Request): Promise<string | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;

  const token = header.slice("Bearer ".length);
  const session = await query<{ username: string }>(
    "SELECT username FROM sessions WHERE token = $1",
    [token]
  );

  return session.rowCount ? session.rows[0].username : null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  void getAuthUser(req).then((username) => {
    if (!username) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    res.locals.username = username;
    next();
  });
}

export function requireRole(role: string) {
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

export default router;