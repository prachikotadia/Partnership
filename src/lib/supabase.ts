import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dobclnswdftadrqftpux.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmNsbnN3ZGZ0YWRycWZ0cHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDY4NTAsImV4cCI6MjA3MzU4Mjg1MH0.sbg7tzATha25ryHWYclW1hV0M_Mx1clQnRBoqiUwfLM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          name: string
          avatar_url?: string
          partner_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          name: string
          avatar_url?: string
          partner_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          name?: string
          avatar_url?: string
          partner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description?: string
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'todo' | 'in_progress' | 'done'
          due_date?: string
          assigned_to?: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'todo' | 'in_progress' | 'done'
          due_date?: string
          assigned_to?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'todo' | 'in_progress' | 'done'
          due_date?: string
          assigned_to?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          title: string
          content: string
          is_pinned: boolean
          reminder_date?: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          is_pinned?: boolean
          reminder_date?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          is_pinned?: boolean
          reminder_date?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      check_ins: {
        Row: {
          id: string
          user_id: string
          date: string
          mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible'
          note?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible'
          note?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible'
          note?: string
          created_at?: string
        }
      }
      finance_entries: {
        Row: {
          id: string
          title: string
          amount: number
          currency: 'USD' | 'INR'
          category: 'income' | 'expense' | 'savings' | 'investment'
          description?: string
          date: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          amount: number
          currency: 'USD' | 'INR'
          category: 'income' | 'expense' | 'savings' | 'investment'
          description?: string
          date: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          amount?: number
          currency?: 'USD' | 'INR'
          category?: 'income' | 'expense' | 'savings' | 'investment'
          description?: string
          date?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      schedule_items: {
        Row: {
          id: string
          title: string
          description?: string
          start_date: string
          end_date?: string
          is_recurring: boolean
          recurring_pattern?: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          start_date: string
          end_date?: string
          is_recurring?: boolean
          recurring_pattern?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          start_date?: string
          end_date?: string
          is_recurring?: boolean
          recurring_pattern?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      bucket_list_items: {
        Row: {
          id: string
          title: string
          description?: string
          category: string
          priority: 'low' | 'medium' | 'high'
          status: 'not_started' | 'in_progress' | 'completed'
          target_date?: string
          cost?: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          category: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'not_started' | 'in_progress' | 'completed'
          target_date?: string
          cost?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'not_started' | 'in_progress' | 'completed'
          target_date?: string
          cost?: number
          created_by?: string
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

// Helper functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return data
}

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name
      }
    }
  })
  if (error) throw error
  return data
}

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw error
}
