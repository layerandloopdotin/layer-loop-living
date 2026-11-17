export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          created_at: string
          id: string
          is_default: boolean
          label: string
          line1: string
          line2: string | null
          name: string
          phone: string
          pin: string
          state: string
          user_id: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          line1: string
          line2?: string | null
          name: string
          phone: string
          pin: string
          state: string
          user_id?: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          line1?: string
          line2?: string | null
          name?: string
          phone?: string
          pin?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          created_at: string
          id: string
          kind: string
          read_at: string | null
          ref_id: string
          sent_at: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          read_at?: string | null
          ref_id: string
          sent_at?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          read_at?: string | null
          ref_id?: string
          sent_at?: string | null
          title?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          email_on: boolean
          id: boolean
          notify_email: string | null
          notify_whatsapp: string | null
          updated_at: string
          whatsapp_on: boolean
        }
        Insert: {
          email_on?: boolean
          id?: boolean
          notify_email?: string | null
          notify_whatsapp?: string | null
          updated_at?: string
          whatsapp_on?: boolean
        }
        Update: {
          email_on?: boolean
          id?: boolean
          notify_email?: string | null
          notify_whatsapp?: string | null
          updated_at?: string
          whatsapp_on?: boolean
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          image: string
          name: string
          sort: number
        }
        Insert: {
          created_at?: string
          id?: string
          image?: string
          name: string
          sort?: number
        }
        Update: {
          created_at?: string
          id?: string
          image?: string
          name?: string
          sort?: number
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          amount: number
          code: string
          created_at: string
          ends_at: string | null
          id: string
          kind: string
          label: string
          min_order: number
          starts_at: string | null
          usage_limit: number | null
        }
        Insert: {
          active?: boolean
          amount: number
          code: string
          created_at?: string
          ends_at?: string | null
          id?: string
          kind?: string
          label?: string
          min_order?: number
          starts_at?: string | null
          usage_limit?: number | null
        }
        Update: {
          active?: boolean
          amount?: number
          code?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          kind?: string
          label?: string
          min_order?: number
          starts_at?: string | null
          usage_limit?: number | null
        }
        Relationships: []
      }
      custom_requests: {
        Row: {
          contact: Json
          created_at: string
          deposit_amount: number
          deposit_status: string
          design: Json
          estimate_high: number
          estimate_low: number
          id: string
          quote: number | null
          quote_note: string | null
          status: string
          summary: string
          thumbnail: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          contact?: Json
          created_at?: string
          deposit_amount?: number
          deposit_status?: string
          design: Json
          estimate_high?: number
          estimate_low?: number
          id?: string
          quote?: number | null
          quote_note?: string | null
          status?: string
          summary?: string
          thumbnail?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          contact?: Json
          created_at?: string
          deposit_amount?: number
          deposit_status?: string
          design?: Json
          estimate_high?: number
          estimate_low?: number
          id?: string
          quote?: number | null
          quote_note?: string | null
          status?: string
          summary?: string
          thumbnail?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      order_events: {
        Row: {
          created_at: string
          id: string
          note: string | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: Json | null
          awb: string | null
          confirmed_at: string | null
          coupon_code: string | null
          courier: string | null
          created_at: string
          custom_request_id: string | null
          discount: number
          id: string
          invoice_url: string | null
          items: Json
          note: string | null
          number: string
          payment_label: string | null
          shipping: number
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: Json | null
          awb?: string | null
          confirmed_at?: string | null
          coupon_code?: string | null
          courier?: string | null
          created_at?: string
          custom_request_id?: string | null
          discount?: number
          id?: string
          invoice_url?: string | null
          items?: Json
          note?: string | null
          number?: string
          payment_label?: string | null
          shipping?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: Json | null
          awb?: string | null
          confirmed_at?: string | null
          coupon_code?: string | null
          courier?: string | null
          created_at?: string
          custom_request_id?: string | null
          discount?: number
          id?: string
          invoice_url?: string | null
          items?: Json
          note?: string | null
          number?: string
          payment_label?: string | null
          shipping?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_inventory: {
        Row: {
          product_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          product_id: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          product_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          care: Json
          category_ids: string[]
          colors: Json
          compare_at_price: number | null
          created_at: string
          engravable: boolean
          engraving_images: string[]
          engraving_max_chars: number
          engraving_placements: string[]
          engraving_price: number
          featured: boolean
          id: string
          images: string[]
          long_description: string
          name: string
          price: number
          published: boolean
          short_description: string
          slug: string
          sort: number
          space_ids: string[]
          specs: Json
          tagline: string
          updated_at: string
          variants: Json
        }
        Insert: {
          care?: Json
          category_ids?: string[]
          colors?: Json
          compare_at_price?: number | null
          created_at?: string
          engravable?: boolean
          engraving_images?: string[]
          engraving_max_chars?: number
          engraving_placements?: string[]
          engraving_price?: number
          featured?: boolean
          id?: string
          images?: string[]
          long_description?: string
          name: string
          price?: number
          published?: boolean
          short_description?: string
          slug: string
          sort?: number
          space_ids?: string[]
          specs?: Json
          tagline?: string
          updated_at?: string
          variants?: Json
        }
        Update: {
          care?: Json
          category_ids?: string[]
          colors?: Json
          compare_at_price?: number | null
          created_at?: string
          engravable?: boolean
          engraving_images?: string[]
          engraving_max_chars?: number
          engraving_placements?: string[]
          engraving_price?: number
          featured?: boolean
          id?: string
          images?: string[]
          long_description?: string
          name?: string
          price?: number
          published?: boolean
          short_description?: string
          slug?: string
          sort?: number
          space_ids?: string[]
          specs?: Json
          tagline?: string
          updated_at?: string
          variants?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string
          comment: string
          created_at: string
          id: string
          images: string[]
          product_slug: string
          rating: number
          status: string
          user_id: string
        }
        Insert: {
          author_name?: string
          comment?: string
          created_at?: string
          id?: string
          images?: string[]
          product_slug: string
          rating: number
          status?: string
          user_id?: string
        }
        Update: {
          author_name?: string
          comment?: string
          created_at?: string
          id?: string
          images?: string[]
          product_slug?: string
          rating?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_designs: {
        Row: {
          created_at: string
          design: Json
          id: string
          name: string
          thumbnail: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          design: Json
          id?: string
          name?: string
          thumbnail?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          design?: Json
          id?: string
          name?: string
          thumbnail?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_payment_methods: {
        Row: {
          created_at: string
          id: string
          kind: string
          label: string
          provider: string
          provider_ref: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          label: string
          provider: string
          provider_ref?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          label?: string
          provider?: string
          provider_ref?: string | null
          user_id?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          data: Json
          key: string
          updated_at: string
        }
        Insert: {
          data?: Json
          key: string
          updated_at?: string
        }
        Update: {
          data?: Json
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      spaces: {
        Row: {
          created_at: string
          id: string
          name: string
          sort: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort?: number
        }
        Relationships: []
      }
      submissions: {
        Row: {
          created_at: string
          data: Json
          id: string
          kind: string
          status: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          kind: string
          status?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          kind?: string
          status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_custom_quote: { Args: { _id: string }; Returns: string }
      admin_exists: { Args: never; Returns: boolean }
      check_coupon: {
        Args: { _code: string; _subtotal: number }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
