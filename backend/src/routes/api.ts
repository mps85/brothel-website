import { Router } from "express";
import { query } from "../db/index.js";

const router = Router();

router.get("/health", async (_req, res) => {
  try {
    await query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

router.get("/messages", async (_req, res) => {
  const result = await query<{ id: number; username: string; message: string; created_at: string }>(
    "SELECT id, username, message, created_at FROM messages ORDER BY created_at ASC"
  );
  res.json(result.rows);
});

router.get("/messages/:id", async (req, res) => {
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

router.post("/messages", async (req, res) => {
  const { username, message } = req.body;

  if (!username || !message || typeof username !== "string" || typeof message !== "string") {
    res.status(400).json({ error: "username and message are required" });
    return;
  }

  try {
    const result = await query<{ id: number; username: string; message: string; created_at: string }>(
      "INSERT INTO messages (username, message) VALUES ($1, $2) RETURNING id, username, message, created_at",
      [username, message.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(400).json({ error: "user not found" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  // TODO: implement missed login counter
  const result = await query<{ username: string }>(
    "SELECT username FROM users WHERE email = $1 AND password = $2",
    [email, password]
  );

  if (result.rowCount === 0) {
    res.status(404).json({ error: "user not found" });
    return;
  }

  res.status(200).json(result.rows[0]);
});

export default router;
