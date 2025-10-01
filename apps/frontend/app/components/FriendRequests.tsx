"use client";

import { FriendRequest } from "@/type";

interface Props {
  friendRequests: FriendRequest[];
  respondRequest: (id: string, action: "accepted" | "rejected") => void;
}

export default function FriendRequests({ friendRequests, respondRequest }: Props) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      {friendRequests.length > 0 && (
        <div className="mb-3 text-red-500 font-semibold">
          {friendRequests.length} new request(s)
        </div>
      )}
      <div className="flex flex-col space-y-2">
        {friendRequests.length === 0 && (
          <p className="text-gray-500">No friend requests</p>
        )}
        {friendRequests.map((req) => (
          <div
            key={req.id}
            className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50 transition"
          >
            <span className="text-gray-700">{req.sender?.name ?? "Unknown User"}</span>
            <div className="flex gap-2">
              <button
                onClick={() => respondRequest(req.id, "accepted")}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
              >
                Accept
              </button>
              <button
                onClick={() => respondRequest(req.id, "rejected")}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
