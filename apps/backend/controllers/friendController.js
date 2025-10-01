// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// // Send Friend Request
// export const sendFriendRequest = async (req, res) => {
//   try {
//     const { receiverId } = req.body;
//     const senderId = req.userId;

//     if (!receiverId) return res.status(400).json({ error: "receiverId required" });
//     if (senderId === receiverId) return res.status(400).json({ error: "Cannot send request to yourself" });

//     const existingRequest = await prisma.friendRequest.findFirst({
//       where: { senderId, receiverId },
//     });
//     if (existingRequest) return res.status(409).json({ error: "Request already sent" });

//     const request = await prisma.friendRequest.create({
//       data: { senderId, receiverId },
//     });

//     res.status(201).json(request);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // List Incoming Friend Requests
// export const getFriendRequests = async (req, res) => {
//   try {
//     const userId = req.userId;
//     const requests = await prisma.friendRequest.findMany({
//       where: { receiverId: userId, status: "pending" },
//       include: { sender: { select: { id: true, name: true, profilePic: true } } },
//     });
//     res.json(requests);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // Respond to Friend Request (accept/reject)
// export const respondFriendRequest = async (req, res) => {
//   try {
//     const { requestId, action } = req.body;
//     const userId = req.userId;

//     if (!requestId || !action) return res.status(400).json({ error: "requestId and action required" });

//     const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
//     if (!request) return res.status(404).json({ error: "Request not found" });
//     if (request.receiverId !== userId) return res.status(403).json({ error: "Not authorized" });

//     if (action === "accepted") {
//       // Create friendship
//       await prisma.friend.create({
//         data: {
//           user1Id: request.senderId,
//           user2Id: request.receiverId,
//         },
//       });
//     }

//     // Delete the friend request after action
//     await prisma.friendRequest.delete({ where: { id: requestId } });

//     res.status(200).json({ message: `Friend request ${action}` });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get Friends
// export const getFriends = async (req, res) => {
//   try {
//     const userId = req.userId;

//     const friends = await prisma.friend.findMany({
//       where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
//     });

//     // Return friend info
//     const friendIds = friends.map(f => f.user1Id === userId ? f.user2Id : f.user1Id);
//     const friendUsers = await prisma.user.findMany({
//       where: { id: { in: friendIds } },
//       select: { id: true, name: true, profilePic: true },
//     });

//     res.json(friendUsers);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };



import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Send Friend Request
export const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.userId;

    if (!receiverId) return res.status(400).json({ error: "receiverId required" });
    if (senderId === receiverId)
      return res.status(400).json({ error: "Cannot send request to yourself" });

    // Check existing request
    const existingRequest = await prisma.friendRequest.findFirst({
      where: { senderId, receiverId },
    });
    if (existingRequest) return res.status(409).json({ error: "Request already sent" });

    // Create request
    const request = await prisma.friendRequest.create({
      data: { senderId, receiverId },
    });

    // Notify receiver in real-time via Socket.IO
    const io = req.app.get("io");
    io.to(receiverId).emit("friendRequest", {
      senderId,
      senderName: req.userName, // make sure req.userName is set in auth middleware
      requestId: request.id,
    });

    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// List Incoming Friend Requests
export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const requests = await prisma.friendRequest.findMany({
      where: { receiverId: userId, status: "pending" },
      include: { sender: { select: { id: true, name: true, profilePic: true } } },
    });

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Respond to Friend Request (accept/reject)
export const respondFriendRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;
    const userId = req.userId;

    if (!requestId || !action)
      return res.status(400).json({ error: "requestId and action required" });

    const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.receiverId !== userId)
      return res.status(403).json({ error: "Not authorized" });

    if (action === "accepted") {
      await prisma.friend.create({
        data: {
          user1Id: request.senderId,
          user2Id: request.receiverId,
        },
      });

      // notification request was accepted
      const io = req.app.get("io");
      io.to(request.senderId).emit("friendRequestAccepted", {
        receiverId: request.receiverId,
        receiverName: req.userName,
      });
    }

    // Delete the request
    await prisma.friendRequest.delete({ where: { id: requestId } });

    res.status(200).json({ message: `Friend request ${action}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get Friends
export const getFriends = async (req, res) => {
  try {
    const userId = req.userId;

    const friends = await prisma.friend.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
    });

    const friendIds = friends.map((f) => (f.user1Id === userId ? f.user2Id : f.user1Id));

    const friendUsers = await prisma.user.findMany({
      where: { id: { in: friendIds } },
      select: { id: true, name: true, profilePic: true },
    });

    res.json(friendUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
