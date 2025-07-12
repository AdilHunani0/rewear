import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url?: string
          points: number
          swap_history: number
          location?: string
          bio?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string
          points?: number
          swap_history?: number
          location?: string
          bio?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string
          points?: number
          swap_history?: number
          location?: string
          bio?: string
          updated_at?: string
        }
      }
      clothing_items: {
        Row: {
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
          uploader_id: string
          uploader_name: string
          uploader_avatar?: string
          uploader_rating: number
          status: "pending" | "available" | "in_negotiation" | "swapped" | "removed"
          views: number
          likes: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          images?: string[]
          category: string
          type: string
          size: string
          condition: string
          points?: number
          tags?: string[]
          uploader_id: string
          uploader_name: string
          uploader_avatar?: string
          uploader_rating?: number
          status?: "pending" | "available" | "in_negotiation" | "swapped" | "removed"
          views?: number
          likes?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          images?: string[]
          category?: string
          type?: string
          size?: string
          condition?: string
          points?: number
          tags?: string[]
          uploader_id?: string
          uploader_name?: string
          uploader_avatar?: string
          uploader_rating?: number
          status?: "pending" | "available" | "in_negotiation" | "swapped" | "removed"
          views?: number
          likes?: string[]
          updated_at?: string
        }
      }
      swap_requests: {
        Row: {
          id: string
          from_user_id: string
          from_user_name: string
          from_item_id: string
          from_item_title: string
          from_item_image: string
          to_user_id: string
          to_user_name: string
          to_item_id: string
          to_item_title: string
          to_item_image: string
          status: "pending" | "accepted" | "rejected" | "completed" | "cancelled"
          message?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          from_user_id: string
          from_user_name: string
          from_item_id: string
          from_item_title: string
          from_item_image: string
          to_user_id: string
          to_user_name: string
          to_item_id: string
          to_item_title: string
          to_item_image: string
          status?: "pending" | "accepted" | "rejected" | "completed" | "cancelled"
          message?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          from_user_id?: string
          from_user_name?: string
          from_item_id?: string
          from_item_title?: string
          from_item_image?: string
          to_user_id?: string
          to_user_name?: string
          to_item_id?: string
          to_item_title?: string
          to_item_image?: string
          status?: "pending" | "accepted" | "rejected" | "completed" | "cancelled"
          message?: string
          updated_at?: string
        }
      }
      swap_messages: {
        Row: {
          id: string
          swap_request_id: string
          sender_id: string
          sender_name: string
          message: string
          message_type: "text" | "system"
          created_at: string
        }
        Insert: {
          id?: string
          swap_request_id: string
          sender_id: string
          sender_name: string
          message: string
          message_type?: "text" | "system"
          created_at?: string
        }
        Update: {
          id?: string
          swap_request_id?: string
          sender_id?: string
          sender_name?: string
          message?: string
          message_type?: "text" | "system"
        }
      }
    }
  }
}
