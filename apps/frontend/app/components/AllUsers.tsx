"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface User {
  id: string;
  name: string;
}

export default function AllUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) return;
    axios
      .get("http://localhost:5000/auth/users", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        console.log(res.data);
        setUsers(res.data);
      })
      .catch(err => console.error(err));
  }, [token]);

  const sendRequest = async (id: string) => {
    if (!token) return;
    try {
      await axios.post(
        "http://localhost:5000/friend-request",
        { receiverId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Friend request sent!");
      setUsers(users.filter(u => u.id !== id)); 
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-3">Send Friend Request</h2>
      <div className="space-y-2">
        {users.length === 0 && <p className="text-gray-500">No users available.</p>}
        {users.map(u => (
          <div
            key={u.id}
            className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition"
          >
            <span className="text-gray-700">{u.name}</span>
            <button
              onClick={() => sendRequest(u.id)}
              className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
            >
              Send Request
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
