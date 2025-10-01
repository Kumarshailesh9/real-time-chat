import express from "express";
import { getAllUsers, login, signup } from "../controllers/authController.js";
import { authenticate } from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login)
router.get("/users", authenticate, getAllUsers);


export default router;
