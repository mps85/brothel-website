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
  const result = await query<{ id: number; content: string; created_at: string }>(
    "SELECT id, content, created_at FROM messages ORDER BY created_at DESC"
  );
  res.json(result.rows);
});

router.post("/messages", async (req, res) => {
  const { content } = req.body;

  if (!content || typeof content !== "string") {
    res.status(400).json({ error: "content is required" });
    return;
  }

  const result = await query<{ id: number; content: string; created_at: string }>(
    "INSERT INTO messages (content) VALUES ($1) RETURNING id, content, created_at",
    [content.trim()]
  );

  res.status(201).json(result.rows[0]);
});

export default router;
