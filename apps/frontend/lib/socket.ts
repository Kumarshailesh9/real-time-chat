import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initiateSocket = (userId: string) => {
  socket = io("http://localhost:5000"); // backend URL
  socket.emit("joinRoom", userId);
  console.log("Connected to socket:", socket.id);
};

export const getSocket = (): Socket | null => socket;
