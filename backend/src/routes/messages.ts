import { Router } from "express";
import { query } from "../db/index.js";
import { requireAuth } from "./auth.js";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  const result = await query<{ id: number; username: string; message: string; created_at: string }>(
    "SELECT id, username, message, created_at FROM messages ORDER BY created_at ASC"
  );
  res.json(result.rows);
});

router.get("/:id", requireAuth, async (req, res) => {
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

router.post("/", requireAuth, async (req, res) => {
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

export default router;