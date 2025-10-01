"use client";

import { User } from "@/type";

interface Props {
  friends: User[];
  selectedFriend: User | null;
  selectFriend: (friend: User) => void;
}

export default function FriendList({ friends, selectedFriend, selectFriend }: Props) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-3">Friends</h2>
      <div className="flex flex-col space-y-2">
        {friends.length === 0 && (
          <p className="text-gray-500">No friends found.</p>
        )}
        {friends.map((friend) => (
          <div
            key={friend.id}
            onClick={() => selectFriend(friend)}
            className={`cursor-pointer p-2 rounded hover:bg-gray-100 transition ${
              selectedFriend?.id === friend.id ? "bg-gray-200" : "bg-white"
            }`}
          >
            {friend.name}
          </div>
        ))}
      </div>
    </div>
  );
}
