export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_amount: number | null
          discount_percent: number
          expiry_date: string | null
          id: string
          is_active: boolean
          minimum_order: number | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          minimum_order?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          minimum_order?: number | null
        }
        Relationships: []
      }
      delivery_assignments: {
        Row: {
          assigned_at: string
          delivered_at: string | null
          driver_id: string
          driver_name: string
          id: string
          order_id: string
          status: string
        }
        Insert: {
          assigned_at?: string
          delivered_at?: string | null
          driver_id: string
          driver_name: string
          id?: string
          order_id: string
          status?: string
        }
        Update: {
          assigned_at?: string
          delivered_at?: string | null
          driver_id?: string
          driver_name?: string
          id?: string
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_assignments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          name: string
          price: number
          status: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          name: string
          price: number
          status: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          status?: string
        }
        Relationships: []
      }
      order_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          order_id: string
          sender_id: string
          sender_role: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          order_id: string
          sender_id: string
          sender_role: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          order_id?: string
          sender_id?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          delivery_address: string | null
          id: string
          items: Json
          order_type: string
          payment_method: string | null
          payment_status: string
          rider_id: string | null
          special_requests: string | null
          status: string
          table_number: string | null
          total: number
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string | null
          id?: string
          items: Json
          order_type: string
          payment_method?: string | null
          payment_status: string
          rider_id?: string | null
          special_requests?: string | null
          status: string
          table_number?: string | null
          total: number
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string | null
          id?: string
          items?: Json
          order_type?: string
          payment_method?: string | null
          payment_status?: string
          rider_id?: string | null
          special_requests?: string | null
          status?: string
          table_number?: string | null
          total?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          preferences: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          phone?: string | null
          preferences?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          preferences?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          guest_count: number
          id: string
          reservation_date: string
          special_requests: string | null
          status: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          guest_count: number
          id?: string
          reservation_date: string
          special_requests?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          guest_count?: number
          id?: string
          reservation_date?: string
          special_requests?: string | null
          status?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
