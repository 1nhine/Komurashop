-- XÓA BẢNG CŨ NẾU CÓ (RESET SẠCH SẼ)
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "inventory" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "deposits" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- 1. BẢNG NGƯỜI DÙNG & VÍ TIỀN
CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "balance" INT NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

-- 2. BẢNG SẢN PHẨM
CREATE TABLE "products" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "price" INT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL DEFAULT 'Dịch vụ mạng',
  "badge" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

-- 3. BẢNG KHO HÀNG (KEY, TÀI KHOẢN, PROXY)
CREATE TABLE "inventory" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "product_id" TEXT REFERENCES "products"("id") ON DELETE CASCADE,
  "content" TEXT NOT NULL,
  "is_sold" BOOLEAN DEFAULT false,
  "order_id" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

-- 4. BẢNG ĐƠN HÀNG ĐÃ MUA
CREATE TABLE "orders" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "order_code" INT UNIQUE NOT NULL,
  "amount" INT NOT NULL,
  "user_id" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
  "product_id" TEXT REFERENCES "products"("id") ON DELETE SET NULL,
  "inventory_content" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

-- 5. BẢNG YÊU CẦU NẠP TIỀN VIETQR
CREATE TABLE "deposits" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "deposit_code" INT UNIQUE NOT NULL,
  "amount" INT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "user_id" TEXT REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

-- TẮT RLS (ROW LEVEL SECURITY) ĐỂ BACKEND REST API ĐỌC GHI DỄ DÀNG VỚI SERVICE KEY
ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "products" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "inventory" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "deposits" DISABLE ROW LEVEL SECURITY;
