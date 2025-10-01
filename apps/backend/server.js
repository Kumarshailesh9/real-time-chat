import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoute.js";
import friendRoutes from "./routes/friendRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Change to your frontend URL in production
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Make Socket.IO instance accessible in controllers
app.set("io", io);

// Routes
app.use("/auth", authRoutes);
app.use("/", friendRoutes);
app.use("/", messageRoutes);

// Test endpoint
app.get("/", (req, res) => res.send("Backend running 🚀"));

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins their personal room after login
  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Chat message
  socket.on("sendMessage", ({ senderId, receiverId, content }) => {
    const message = {
      senderId,
      receiverId,
      content,
      createdAt: new Date(),
    };
    io.to(receiverId).emit("newMessage", message);
  });

  // Typing indicator
  socket.on("typing", (receiverId) => {
    io.to(receiverId).emit("typing");
  });

  socket.on("stopTyping", (receiverId) => {
    io.to(receiverId).emit("stopTyping");
  });

  // Friend request
  socket.on("friendRequest", ({ senderId, receiverId }) => {
    io.to(receiverId).emit("friendRequest", { senderId });
  });

  // Friend request accepted
  socket.on("friendRequestAccepted", ({ senderId, receiverId }) => {
    io.to(senderId).emit("friendRequestAccepted", { receiverId });
  });

  // Voice message
  socket.on("voiceMessage", ({ senderId, receiverId, audioData }) => {
    io.to(receiverId).emit("voiceMessage", { senderId, audioData, createdAt: new Date() });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
