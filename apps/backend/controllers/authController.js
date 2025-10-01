import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// signup
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    // remove password from response
    const { password: _p, ...safeUser } = user;
    return res.status(201).json({ user: safeUser, token });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id ,name:user.name }, JWT_SECRET, { expiresIn: "7d" });

    // remove password 
    const { password: _p, ...safeUser } = user;
    return res.json({ user: safeUser, token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

////////////////get all users for sending request them//////////////////////

export const getAllUsers = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUserId = decoded.userId;

    //get friends
    const friends = await prisma.friend.findMany({
      where: { OR: [{ user1Id: currentUserId }, { user2Id: currentUserId }] },
    });
    const friendIds = friends.map(f => f.user1Id === currentUserId ? f.user2Id : f.user1Id);

    // Get pending requests (sent or received)
    const pending = await prisma.friendRequest.findMany({
      where: { OR: [{ senderId: currentUserId }, { receiverId: currentUserId }] },
    });
    const requestIds = pending.map(r => r.senderId === currentUserId ? r.receiverId : r.senderId);

    // Exclude friends, pending requests, and yourself
    const excludeIds = [...new Set([...friendIds, ...requestIds, currentUserId])];


    const users = await prisma.user.findMany({
      where: { id: { notIn: excludeIds } },
      select: { id: true, name: true },
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
