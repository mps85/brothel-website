import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import messagesRouter from "./messages.js";
import usersRouter from "./users.js";

const router = Router();

router.use("/health", healthRouter);
router.use(authRouter);
router.use("/messages", messagesRouter);
router.use("/users", usersRouter);

export default router;