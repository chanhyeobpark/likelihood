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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          phone_verified: boolean
          default_address_id: string | null
          role: 'USER' | 'ADMIN'
          tier: 'STANDARD' | 'SILVER' | 'GOLD' | 'VIP'
          total_spent: number
          points_balance: number
          locale: string
          marketing_consent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          phone_verified?: boolean
          default_address_id?: string | null
          role?: 'USER' | 'ADMIN'
          tier?: 'STANDARD' | 'SILVER' | 'GOLD' | 'VIP'
          total_spent?: number
          points_balance?: number
          locale?: string
          marketing_consent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          phone_verified?: boolean
          default_address_id?: string | null
          role?: 'USER' | 'ADMIN'
          tier?: 'STANDARD' | 'SILVER' | 'GOLD' | 'VIP'
          total_spent?: number
          points_balance?: number
          locale?: string
          marketing_consent?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string | null
          recipient_name: string
          phone: string
          postal_code: string
          address_line1: string
          address_line2: string | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label?: string | null
          recipient_name: string
          phone: string
          postal_code: string
          address_line1: string
          address_line2?: string | null
          is_default?: boolean
          created_at?: string
        }
        Update: {
          user_id?: string
          label?: string | null
          recipient_name?: string
          phone?: string
          postal_code?: string
          address_line1?: string
          address_line2?: string | null
          is_default?: boolean
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          slug: string
          name_ko: string
          name_en: string
          description_ko: string | null
          description_en: string | null
          parent_id: string | null
          image_url: string | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name_ko: string
          name_en: string
          description_ko?: string | null
          description_en?: string | null
          parent_id?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          slug?: string
          name_ko?: string
          name_en?: string
          description_ko?: string | null
          description_en?: string | null
          parent_id?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          slug: string
          sku_prefix: string
          name_ko: string
          name_en: string
          description_ko: string | null
          description_en: string | null
          material_ko: string | null
          material_en: string | null
          care_instructions_ko: string | null
          care_instructions_en: string | null
          category_id: string
          base_price: number
          compare_at_price: number | null
          currency: string
          is_active: boolean
          is_new: boolean
          is_featured: boolean
          gender: 'M' | 'F' | 'U' | null
          season: string | null
          weight_grams: number | null
          meta_title_ko: string | null
          meta_title_en: string | null
          meta_description_ko: string | null
          meta_description_en: string | null
          search_vector: unknown
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          sku_prefix: string
          name_ko: string
          name_en: string
          description_ko?: string | null
          description_en?: string | null
          material_ko?: string | null
          material_en?: string | null
          care_instructions_ko?: string | null
          care_instructions_en?: string | null
          category_id: string
          base_price: number
          compare_at_price?: number | null
          currency?: string
          is_active?: boolean
          is_new?: boolean
          is_featured?: boolean
          gender?: 'M' | 'F' | 'U' | null
          season?: string | null
          weight_grams?: number | null
          meta_title_ko?: string | null
          meta_title_en?: string | null
          meta_description_ko?: string | null
          meta_description_en?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          sku_prefix?: string
          name_ko?: string
          name_en?: string
          description_ko?: string | null
          description_en?: string | null
          material_ko?: string | null
          material_en?: string | null
          care_instructions_ko?: string | null
          care_instructions_en?: string | null
          category_id?: string
          base_price?: number
          compare_at_price?: number | null
          currency?: string
          is_active?: boolean
          is_new?: boolean
          is_featured?: boolean
          gender?: 'M' | 'F' | 'U' | null
          season?: string | null
          weight_grams?: number | null
          meta_title_ko?: string | null
          meta_title_en?: string | null
          meta_description_ko?: string | null
          meta_description_en?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_text_ko: string | null
          alt_text_en: string | null
          sort_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt_text_ko?: string | null
          alt_text_en?: string | null
          sort_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          product_id?: string
          url?: string
          alt_text_ko?: string | null
          alt_text_en?: string | null
          sort_order?: number
          is_primary?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          sku: string
          size: string
          color_name_ko: string
          color_name_en: string
          color_hex: string | null
          price_override: number | null
          stock_quantity: number
          low_stock_threshold: number
          is_active: boolean
          barcode: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          sku: string
          size: string
          color_name_ko: string
          color_name_en: string
          color_hex?: string | null
          price_override?: number | null
          stock_quantity?: number
          low_stock_threshold?: number
          is_active?: boolean
          barcode?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          product_id?: string
          sku?: string
          size?: string
          color_name_ko?: string
          color_name_en?: string
          color_hex?: string | null
          price_override?: number | null
          stock_quantity?: number
          low_stock_threshold?: number
          is_active?: boolean
          barcode?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          guest_email: string | null
          status: 'PENDING_PAYMENT' | 'PAID' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUND_REQUESTED' | 'REFUNDED'
          shipping_name: string
          shipping_phone: string
          shipping_postal_code: string
          shipping_address_line1: string
          shipping_address_line2: string | null
          shipping_memo: string | null
          shipping_carrier: string | null
          tracking_number: string | null
          subtotal: number
          shipping_fee: number
          discount_amount: number
          points_used: number
          total: number
          currency: string
          payment_method: string | null
          payment_key: string | null
          paid_at: string | null
          coupon_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          user_id?: string | null
          guest_email?: string | null
          status?: 'PENDING_PAYMENT' | 'PAID' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUND_REQUESTED' | 'REFUNDED'
          shipping_name: string
          shipping_phone: string
          shipping_postal_code: string
          shipping_address_line1: string
          shipping_address_line2?: string | null
          shipping_memo?: string | null
          shipping_carrier?: string | null
          tracking_number?: string | null
          subtotal: number
          shipping_fee?: number
          discount_amount?: number
          points_used?: number
          total: number
          currency?: string
          payment_method?: string | null
          payment_key?: string | null
          paid_at?: string | null
          coupon_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          order_number?: string
          user_id?: string | null
          guest_email?: string | null
          status?: 'PENDING_PAYMENT' | 'PAID' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUND_REQUESTED' | 'REFUNDED'
          shipping_name?: string
          shipping_phone?: string
          shipping_postal_code?: string
          shipping_address_line1?: string
          shipping_address_line2?: string | null
          shipping_memo?: string | null
          shipping_carrier?: string | null
          tracking_number?: string | null
          subtotal?: number
          shipping_fee?: number
          discount_amount?: number
          points_used?: number
          total?: number
          currency?: string
          payment_method?: string | null
          payment_key?: string | null
          paid_at?: string | null
          coupon_id?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          variant_id: string
          product_name_ko: string
          product_name_en: string
          variant_label: string
          quantity: number
          unit_price: number
          subtotal: number
          product_image_url: string | null
        }
        Insert: {
          id?: string
          order_id: string
          variant_id: string
          product_name_ko: string
          product_name_en: string
          variant_label: string
          quantity: number
          unit_price: number
          subtotal: number
          product_image_url?: string | null
        }
        Update: {
          order_id?: string
          variant_id?: string
          product_name_ko?: string
          product_name_en?: string
          variant_label?: string
          quantity?: number
          unit_price?: number
          subtotal?: number
          product_image_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      coupons: {
        Row: {
          id: string
          code: string
          name_ko: string
          name_en: string
          type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'
          value: number
          min_order_amount: number
          max_discount_amount: number | null
          applicable_category_id: string | null
          usage_limit: number | null
          usage_count: number
          per_user_limit: number
          starts_at: string
          expires_at: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name_ko: string
          name_en: string
          type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'
          value: number
          min_order_amount?: number
          max_discount_amount?: number | null
          applicable_category_id?: string | null
          usage_limit?: number | null
          usage_count?: number
          per_user_limit?: number
          starts_at: string
          expires_at: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          code?: string
          name_ko?: string
          name_en?: string
          type?: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'
          value?: number
          min_order_amount?: number
          max_discount_amount?: number | null
          applicable_category_id?: string | null
          usage_limit?: number | null
          usage_count?: number
          per_user_limit?: number
          starts_at?: string
          expires_at?: string
          is_active?: boolean
        }
        Relationships: []
      }
      coupon_usages: {
        Row: {
          id: string
          coupon_id: string
          user_id: string
          order_id: string
          used_at: string
        }
        Insert: {
          id?: string
          coupon_id: string
          user_id: string
          order_id: string
          used_at?: string
        }
        Update: {
          coupon_id?: string
          user_id?: string
          order_id?: string
          used_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          order_item_id: string | null
          rating: number
          title: string | null
          body: string | null
          size_feedback: 'SMALL' | 'TRUE_TO_SIZE' | 'LARGE' | null
          purchased_size: string | null
          height_cm: number | null
          weight_kg: number | null
          image_urls: string[] | null
          is_verified_purchase: boolean
          is_visible: boolean
          admin_reply: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          order_item_id?: string | null
          rating: number
          title?: string | null
          body?: string | null
          size_feedback?: 'SMALL' | 'TRUE_TO_SIZE' | 'LARGE' | null
          purchased_size?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          image_urls?: string[] | null
          is_verified_purchase?: boolean
          is_visible?: boolean
          admin_reply?: string | null
          created_at?: string
        }
        Update: {
          product_id?: string
          user_id?: string
          order_item_id?: string | null
          rating?: number
          title?: string | null
          body?: string | null
          size_feedback?: 'SMALL' | 'TRUE_TO_SIZE' | 'LARGE' | null
          purchased_size?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          image_urls?: string[] | null
          is_verified_purchase?: boolean
          is_visible?: boolean
          admin_reply?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      points_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: 'PURCHASE_EARN' | 'REVIEW_EARN' | 'SIGNUP_BONUS' | 'PURCHASE_SPEND' | 'ADMIN_ADJUST' | 'EXPIRED'
          reference_id: string | null
          description_ko: string | null
          description_en: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: 'PURCHASE_EARN' | 'REVIEW_EARN' | 'SIGNUP_BONUS' | 'PURCHASE_SPEND' | 'ADMIN_ADJUST' | 'EXPIRED'
          reference_id?: string | null
          description_ko?: string | null
          description_en?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          user_id?: string
          amount?: number
          type?: 'PURCHASE_EARN' | 'REVIEW_EARN' | 'SIGNUP_BONUS' | 'PURCHASE_SPEND' | 'ADMIN_ADJUST' | 'EXPIRED'
          reference_id?: string | null
          description_ko?: string | null
          description_en?: string | null
          expires_at?: string | null
        }
        Relationships: []
      }
      inventory_logs: {
        Row: {
          id: string
          variant_id: string
          change_quantity: number
          reason: 'ORDER' | 'RESTOCK' | 'ADJUSTMENT' | 'RETURN' | 'CANCEL'
          reference_id: string | null
          admin_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          variant_id: string
          change_quantity: number
          reason: 'ORDER' | 'RESTOCK' | 'ADJUSTMENT' | 'RETURN' | 'CANCEL'
          reference_id?: string | null
          admin_id?: string | null
          created_at?: string
        }
        Update: {
          variant_id?: string
          change_quantity?: number
          reason?: 'ORDER' | 'RESTOCK' | 'ADJUSTMENT' | 'RETURN' | 'CANCEL'
          reference_id?: string | null
          admin_id?: string | null
        }
        Relationships: []
      }
      custom_orders: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          category: 'pants' | 'jacket' | 'shirt' | 'coat' | 'dress' | 'knit' | 'other'
          quantity: number
          budget_min: number | null
          budget_max: number | null
          desired_date: string | null
          reference_images: string[] | null
          size_info: string | null
          status: 'PENDING' | 'REVIEWING' | 'QUOTED' | 'ACCEPTED' | 'IN_PRODUCTION' | 'COMPLETED' | 'CANCELLED'
          admin_reply: string | null
          quoted_price: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          category: 'pants' | 'jacket' | 'shirt' | 'coat' | 'dress' | 'knit' | 'other'
          quantity?: number
          budget_min?: number | null
          budget_max?: number | null
          desired_date?: string | null
          reference_images?: string[] | null
          size_info?: string | null
          status?: 'PENDING' | 'REVIEWING' | 'QUOTED' | 'ACCEPTED' | 'IN_PRODUCTION' | 'COMPLETED' | 'CANCELLED'
          admin_reply?: string | null
          quoted_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          title?: string
          description?: string
          category?: 'pants' | 'jacket' | 'shirt' | 'coat' | 'dress' | 'knit' | 'other'
          quantity?: number
          budget_min?: number | null
          budget_max?: number | null
          desired_date?: string | null
          reference_images?: string[] | null
          size_info?: string | null
          status?: 'PENDING' | 'REVIEWING' | 'QUOTED' | 'ACCEPTED' | 'IN_PRODUCTION' | 'COMPLETED' | 'CANCELLED'
          admin_reply?: string | null
          quoted_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      generate_order_number: {
        Args: Record<string, never>
        Returns: string
      }
      decrement_stock: {
        Args: { p_variant_id: string; p_quantity: number }
        Returns: undefined
      }
      restore_stock: {
        Args: { p_variant_id: string; p_quantity: number }
        Returns: undefined
      }
      increment_coupon_usage: {
        Args: { p_coupon_id: string }
        Returns: undefined
      }
      cleanup_pending_orders: {
        Args: Record<string, never>
        Returns: number
      }
      validate_variant_active: {
        Args: { p_variant_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience aliases
export type Profile = Tables<'profiles'>
export type Address = Tables<'addresses'>
export type Category = Tables<'categories'>
export type Product = Tables<'products'>
export type ProductImage = Tables<'product_images'>
export type ProductVariant = Tables<'product_variants'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type Coupon = Tables<'coupons'>
export type Review = Tables<'reviews'>
export type Wishlist = Tables<'wishlists'>
export type PointsTransaction = Tables<'points_transactions'>
export type InventoryLog = Tables<'inventory_logs'>
export type CustomOrder = Tables<'custom_orders'>

// Extended types with relations
export type ProductWithDetails = Product & {
  category: Category
  images: ProductImage[]
  variants: ProductVariant[]
}

export type OrderWithItems = Order & {
  items: OrderItem[]
}

export type ReviewWithUser = Review & {
  user: Pick<Profile, 'full_name'>
}
