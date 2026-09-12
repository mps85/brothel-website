import { Router } from "express";
import { query } from "../db/index.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    await query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

export default router;