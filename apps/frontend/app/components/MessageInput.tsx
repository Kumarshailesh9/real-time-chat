"use client";

import { useRef, useState, useEffect } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface Props {
  newMessage: string;
  setNewMessage: (value: string) => void;
  sendMessage: () => void;
  handleTyping: () => void;
}

export default function MessageInput({
  newMessage,
  setNewMessage,
  sendMessage,
  handleTyping,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef<HTMLDivElement | null>(null);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(newMessage + emojiData.emoji);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div ref={inputRef} className="relative mt-4 flex flex-col">
      {showPicker && (
        <div className="absolute bottom-14 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowPicker((prev) => !prev)}
          className="text-2xl cursor-pointer hover:scale-110 transition"
        >
          😊
        </button>

        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
        />

        <button
          onClick={sendMessage}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
