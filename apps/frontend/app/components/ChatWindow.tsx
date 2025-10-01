"use client";

import { Message, User } from "@/type";
import { useRef, useEffect } from "react";

interface Props {
  messages: Message[];
  userId: string | null | undefined;
  selectedFriend: User | null;
  typing: boolean;
}

export default function ChatWindow({ messages, userId, selectedFriend, typing }: Props) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 border border-gray-300 rounded-lg bg-white">
      <div className="flex flex-col space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={msg.id || msg.messageId || idx}
            className={`flex ${msg.senderId === userId ? "justify-end" : "justify-start"}`}
          >
            <span
              className={`inline-block px-4 py-2 rounded-2xl max-w-xs break-words ${
                msg.senderId === userId ? "bg-blue-400 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}

        {typing && selectedFriend && (
          <div className="text-gray-500 italic">Typing...</div>
        )}

        <div ref={messagesEndRef}></div>
      </div>
    </div>
  );
}
