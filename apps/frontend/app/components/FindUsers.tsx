"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { User } from "@/type";
import { toast } from "react-toastify";

interface Props {
  token: string | null;
}

export default function FindUsers({ token }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get<User[]>("http://localhost:5000/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const sendFriendRequest = async (receiverId: string) => {
    if (!token) return;
    try {
      await axios.post(
        "http://localhost:5000/friend-request",
        { receiverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Friend request sent!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to send request");
    }
  };

  if (!token)
    return <p className="text-center text-gray-500 mt-4">Please log in</p>;

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Find Users</h2>

      {loading ? (
        <p className="text-gray-500">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50 transition"
            >
              <span className="text-gray-700">{user.name}</span>
              <button
                onClick={() => sendFriendRequest(user.id)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
              >
                Add Friend
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
