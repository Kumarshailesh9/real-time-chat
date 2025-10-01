export interface User {
  id: string;
  name: string;
  profilePic?: string;
}

export interface Message {
  id: string;
  messageId?: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  sender: User;
}

export interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}
