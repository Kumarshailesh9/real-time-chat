import express from "express";
import { getMessages, sendMessage } from "../controllers/messageController.js";
import { authenticate } from "../utils/authMiddleware.js";

const router = express.Router();

router.get("/messages/:friendId", authenticate, getMessages);
router.post("/messages", authenticate, sendMessage);

export default router;
