export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: "STUDENT" | "ADMIN";
  created_at: string;
};

export type Service = {
  id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  features: string[];
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
        Update: Partial<Omit<Order, "id" | "created_at" | "updated_at">>;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
