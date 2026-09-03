# NoveltyScholars - Academic Order Platform

A full-stack academic writing order platform built with Next.js 15, Supabase, and Tailwind CSS.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Auth, Database, Storage, Realtime)
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works fine)

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from the API settings
3. Get the service_role key from the same API settings page

### 2. Run SQL Schema

Go to the SQL Editor in your Supabase dashboard and run the following:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'ADMIN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  base_price INTEGER NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  academic_level TEXT NOT NULL,
  pages INTEGER NOT NULL,
  words INTEGER NOT NULL,
  deadline DATE NOT NULL,
  description TEXT NOT NULL,
  total_price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK (status IN ('PENDING_PAYMENT', 'PAID', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED', 'REVISION')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create order_files table
CREATE TABLE order_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'REFERENCE' CHECK (file_type IN ('REFERENCE', 'FINAL')),
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Create indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_files_order_id ON order_files(order_id);
CREATE INDEX idx_messages_order_id ON messages(order_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security (permissive for MVP)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow all read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow all read services" ON services FOR SELECT USING (true);

CREATE POLICY "Allow users to read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow admin read all orders" ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Allow insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow read order files" ON order_files FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_files.order_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Allow insert order files" ON order_files FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read messages for own orders" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = messages.order_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Allow insert messages" ON messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE id = messages.order_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
```

### 3. Create Storage Bucket

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `order-files`
3. Set it as public (or keep private — we use signed URLs)
4. Add bucket RLS policies:

```sql
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'order-files');

CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'order-files');
```

### 4. Create Admin User

1. Register a new account through the `/register` page
2. Go to the Supabase SQL Editor and run:

```sql
UPDATE profiles SET role = 'ADMIN' WHERE email = 'admin@noveltyscholars.com';
```

Replace the email with your actual admin email.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PAYSTACK_SECRET_KEY=sk_test_your-secret-key
NEXT_PUBLIC_APP_URL=https://noveltyscholars.vercel.app
```

## Running the App

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── admin/           # Admin panel
│   │   ├── orders/      # Manage orders
│   │   └── services/    # CRUD services
│   ├── api/
│   │   └── payment/     # Mock payment + webhook
│   ├── auth/
│   │   └── callback/    # Auth callback
│   ├── checkout/        # Checkout page
│   ├── dashboard/       # Student dashboard
│   │   └── orders/      # Order detail
│   ├── login/           # Login page
│   ├── order/           # Order form (3-step)
│   ├── pricing/         # Pricing page
│   ├── privacy-policy/  # Privacy policy
│   ├── register/        # Register page
│   ├── services/        # Service detail
│   ├── terms/           # Terms & conditions
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx         # Homepage
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── PricingCalculator.tsx
│   ├── StatusTimeline.tsx
│   ├── ChatBox.tsx
│   ├── FileUpload.tsx
│   ├── OrderCard.tsx
│   └── ServicesGrid.tsx
├── hooks/
│   └── use-toast.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── service.ts
│   │   └── middleware.ts
│   ├── types.ts
│   └── utils.ts
├── middleware.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

## Features

- **Authentication:** Email/password auth with Supabase
- **Order Flow:** 3-step order form with live pricing calculator
- **File Upload:** Drag & drop to Supabase Storage (PDF, DOCX, ZIP, PNG, JPG)
- **Realtime Chat:** Supabase Realtime postgres_changes for instant messaging
- **Admin Panel:** Order management, status changes, service CRUD
- **Payment:** Paystack hosted checkout with server verification and signed webhooks
- **Responsive Design:** Mobile-first, works on all devices

## Paystack Setup

1. Run `PAYSTACK_MIGRATION.sql` in the Supabase SQL Editor.
2. Add `PAYSTACK_SECRET_KEY` and `NEXT_PUBLIC_APP_URL` to Vercel.
3. In Paystack test mode, configure:
   - Callback URL: `https://noveltyscholars.vercel.app/payment/callback`
   - Webhook URL: `https://noveltyscholars.vercel.app/api/payment/paystack/webhook`
4. Complete a test payment and confirm that the payment row becomes `SUCCESS`
   and the associated order becomes `PAID`.
5. Only after testing, replace the test secret with the live secret and configure
   the same URLs in Paystack live mode.

Paystack is initialized only from the backend. The application calculates the
USD amount from the stored order, verifies the reference, amount, and currency,
and validates webhook signatures before updating an order.

## License

Private - All rights reserved.
