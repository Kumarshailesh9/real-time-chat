"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";

import Logout from "@/logout/page";
import FriendList from "../components/FriendList";
import FriendRequests from "../components/FriendRequests";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import AllUsers from "../components/AllUsers";
import { User, Message, FriendRequest, DecodedToken } from "@/type";
import { toast } from "react-toastify";

let socket: Socket;

const decodeToken = (token: string): DecodedToken | null => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export default function Dashboard() {
  const [friends, setFriends] = useState<User[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [typing, setTyping] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userId = token ? decodeToken(token)?.userId : null;

  const fetchFriends = async () => {
    if (!token) return;
    try {
      const res = await axios.get<User[]>("http://localhost:5000/friends", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFriendRequests = async () => {
    if (!token) return;
    try {
      const res = await axios.get<FriendRequest[]>("http://localhost:5000/friend-request", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriendRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
  }, [token]);

  useEffect(() => {
    if (!userId) return;

    socket = io("http://localhost:5000");
    socket.emit("joinRoom", userId);

    
    socket.on("newMessage", (message: Message) => {
      if (message.senderId === selectedFriend?.id || message.receiverId === selectedFriend?.id) {
        setMessages((prev) => [...prev, message]);
      }
    });

   
    socket.on("typing", (senderId: string) => {
      if (selectedFriend?.id === senderId) setTyping(true);
    });

    socket.on("stopTyping", (senderId: string) => {
      if (selectedFriend?.id === senderId) setTyping(false);
    });

   
    socket.on("friendRequest", (request: FriendRequest) => {
      setFriendRequests((prev) => [...prev, request]);
      toast.success(`New friend request from ${request.sender.name}`);
    });

    socket.on("friendRequestAccepted", (data: { receiverName: string }) => {
      toast.success(`${data.receiverName} accepted your friend request!`);
      fetchFriends();
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, selectedFriend]);

  const selectFriend = async (friend: User) => {
    setSelectedFriend(friend);
    if (!token) return;
    try {
      const res = await axios.get<Message[]>(`http://localhost:5000/messages/${friend.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend || !token) return;
    try {
      const res = await axios.post<Message>(
        "http://localhost:5000/messages",
        { friendId: selectedFriend.id, content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
      socket.emit("stopTyping", selectedFriend.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTyping = () => {
    if (!selectedFriend) return;
    socket.emit("typing", selectedFriend.id);
    setTimeout(() => {
      socket.emit("stopTyping", selectedFriend.id);
    }, 1000);
  };

  const respondRequest = async (requestId: string, action: "accepted" | "rejected") => {
    if (!token) return;
    try {
      await axios.post(
        "http://localhost:5000/friend-request/respond",
        { requestId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
      fetchFriends();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Logout />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/4 border-r border-gray-300 p-4 flex flex-col gap-4 overflow-y-auto bg-gray-50">
          <FriendRequests friendRequests={friendRequests} respondRequest={respondRequest} />
          <FriendList friends={friends} selectedFriend={selectedFriend} selectFriend={selectFriend} />
          <AllUsers />
        </div>

        {/* Chat Section */}
        <div className="flex-1 flex flex-col p-4">
          <h2 className="text-xl font-semibold mb-4">
            Chat with <span className="text-gray-600">{selectedFriend?.name || "Select a friend"}</span>
          </h2>
          <div className="flex-1 overflow-y-auto mb-2">
            <ChatWindow
              messages={messages}
              userId={userId}
              selectedFriend={selectedFriend}
              typing={typing}
            />
          </div>
          {typing && <div className="text-gray-500 mb-2">Typing...</div>}
          <MessageInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            sendMessage={sendMessage}
            handleTyping={handleTyping}
          />
        </div>
      </div>
    </div>
  );
}
