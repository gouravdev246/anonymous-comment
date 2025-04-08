export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      comments: {
        Row: {
          created_at: string
          id: string
          is_reported: boolean
          parent_id: string | null
          text: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_reported?: boolean
          parent_id?: string | null
          text: string
          username?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_reported?: boolean
          parent_id?: string | null
          text?: string
          username?: string
        }
      }
      music_state: {
        Row: {
          id: string
          track_id: string
          track_name: string
          artist_name: string
          album_name: string
          album_image: string
          uri: string
          is_playing: boolean
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          track_id: string
          track_name: string
          artist_name: string
          album_name: string
          album_image: string
          uri: string
          is_playing?: boolean
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          track_id?: string
          track_name?: string
          artist_name?: string
          album_name?: string
          album_image?: string
          uri?: string
          is_playing?: boolean
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 