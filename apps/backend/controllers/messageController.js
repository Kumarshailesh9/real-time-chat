import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Get all messages in chatbox
export const getMessages = async (req, res) => {
  try {
    const userId = req.userId;
    const { friendId } = req.params;

    if (!friendId) return res.status(400).json({ error: "friendId is required" });

    // if friend exists
    const friend = await prisma.user.findUnique({ where: { id: friendId } });
    if (!friend) return res.status(404).json({ error: "Friend not found" });

    // Fetch messages in both users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Send a message socket.io
export const sendMessage = async (req, res) => {
  try {
    const { friendId, content } = req.body;
    const senderId = req.userId;

    if (!friendId || !content) {
      return res.status(400).json({ error: "friendId and content required" });
    }

    // ? receiver exists
    const receiver = await prisma.user.findUnique({ where: { id: friendId } });
    if (!receiver) return res.status(404).json({ error: "Receiver not found" });

    // Save message in database
    const message = await prisma.message.create({
      data: { senderId, receiverId: friendId, content },
    });

    //  if io exists
    const io = req.app.get("io");
    if (io) {
      io.to(friendId).emit("newMessage", {
        messageId: message.id,
        senderId,
        content,
        createdAt: message.createdAt,
      });
    }

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
