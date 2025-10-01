import express from "express";
import { 
  sendFriendRequest, 
  respondFriendRequest, 
  getFriendRequests, 
  getFriends 
} from "../controllers/friendController.js";
import { authenticate } from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/friend-request", authenticate, sendFriendRequest);
router.post("/friend-request/respond", authenticate, respondFriendRequest);
router.get("/friend-request", authenticate, getFriendRequests);
router.get("/friends", authenticate, getFriends);

export default router;
