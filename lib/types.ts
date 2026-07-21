export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: "STUDENT" | "ADMIN";
  is_banned?: boolean;
  created_at: string;
};

export type ServiceType = "STANDARD" | "ONLINE_CLASS" | "ONLINE_EXAM";

export type Service = {
  id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  features: string[];
  service_type: ServiceType;
  is_featured: boolean;
  created_at: string;
};

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "IN_PROGRESS"
  | "DELIVERED"
  | "COMPLETED"
  | "REVISION";

export type Order = {
  id: string;
  order_code: string;
  user_id: string;
  service_id: string;
  subject: string;
  topic: string;
  academic_level: string;
  pages: number;
  words: number;
  deadline: string;
  description: string;
  total_price: number;
  status: OrderStatus;
  lms_platform: string | null;
  login_credentials: string | null;
  class_duration: string | null;
  discount_code: string | null;
  discount_amount: number;
  final_price: number | null;
  created_at: string;
  updated_at: string;
};

export type OrderFile = {
  id: string;
  order_id: string;
  file_name: string;
  file_url: string;
  file_type: "REFERENCE" | "FINAL";
  uploaded_by: string;
  created_at: string;
};

export type Message = {
  id: string;
  order_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export type PromoCode = {
  id: string;
  code: string;
  discount_type: "PERCENTAGE" | "FIXED";
  discount_value: number;
  max_uses: number;
  used_count: number;
  min_order_amount: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  author: string;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  views: number;
  created_at: string;
  updated_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  is_read: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Json = any;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
        Relationships: [];
      };
      services: {
        Row: Service;
        Insert: Omit<Service, "id" | "created_at">;
        Update: Partial<Omit<Service, "id" | "created_at">>;
        Relationships: [];
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Order, "id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_service_id_fkey";
            columns: ["service_id"];
            referencedRelation: "services";
            referencedColumns: ["id"];
          }
        ];
      };
      order_files: {
        Row: OrderFile;
        Insert: Omit<OrderFile, "id" | "created_at">;
        Update: Partial<Omit<OrderFile, "id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "order_files_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at">;
        Update: Partial<Omit<Message, "id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "messages_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      promo_codes: {
        Row: PromoCode;
        Insert: Omit<PromoCode, "id" | "created_at">;
        Update: Partial<Omit<PromoCode, "id" | "created_at">>;
        Relationships: [];
      };
      blog_posts: {
        Row: BlogPost;
        Insert: Omit<BlogPost, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<BlogPost, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      contact_messages: {
        Row: ContactMessage;
        Insert: Omit<ContactMessage, "id" | "created_at">;
        Update: Partial<Omit<ContactMessage, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};