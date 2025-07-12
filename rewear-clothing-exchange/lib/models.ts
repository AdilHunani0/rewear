export interface User {
  _id?: string
  id: string
  name: string
  email: string
  password?: string
  points: number
  swapHistory: number
  avatar?: string
  joinDate: string
  location?: string
  bio?: string
}

export interface ClothingItem {
  _id?: string
  id: string
  title: string
  description: string
  images: string[]
  category: string
  type: string
  size: string
  condition: string
  points: number
  tags: string[]
  uploaderId: string
  uploaderName: string
  uploaderAvatar?: string
  uploaderRating: number
  status: "pending" | "available" | "in_negotiation" | "swapped" | "removed"
  createdAt: string
  updatedAt: string
  views: number
  likes: string[] // Array of user IDs who liked this item
}

export interface SwapRequest {
  _id?: string
  id: string
  fromUserId: string
  fromUserName: string
  fromItemId: string
  fromItemTitle: string
  fromItemImage: string
  toUserId: string
  toUserName: string
  toItemId: string
  toItemTitle: string
  toItemImage: string
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled"
  message?: string
  createdAt: string
  updatedAt: string
}

export interface SwapConversation {
  _id?: string
  id: string
  swapRequestId: string
  participants: string[] // Array of user IDs
  messages: SwapMessage[]
  createdAt: string
  updatedAt: string
}

export interface SwapMessage {
  id: string
  senderId: string
  senderName: string
  message: string
  timestamp: string
  type: "text" | "system"
}
