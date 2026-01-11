-- CreateTable
CREATE TABLE "leads" (
    "id" SERIAL NOT NULL,
    "reference_no" VARCHAR(100),
    "lead_name" VARCHAR(150) NOT NULL,
    "contact" VARCHAR(150),
    "email" VARCHAR(150),
    "phone" VARCHAR(50),
    "type" VARCHAR(100),
    "company" VARCHAR(150),
    "location" VARCHAR(150),
    "product_interest" VARCHAR(200),
    "source" VARCHAR(100),
    "note" TEXT,
    "id_user" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "assigned_to" INTEGER,
    "status" VARCHAR(50) DEFAULT 'Open',

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "product_code" VARCHAR(100) NOT NULL,
    "item_group" VARCHAR(100),
    "name" VARCHAR(200) NOT NULL,
    "unit" VARCHAR(50),
    "part_number" VARCHAR(150),
    "description" TEXT,
    "price" DECIMAL(18,2) DEFAULT 0,
    "stock" INTEGER DEFAULT 0,
    "brand" VARCHAR(100),
    "rack" VARCHAR(100),
    "images" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" SERIAL NOT NULL,
    "quotation_no" VARCHAR(50) NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "quotation_detail" JSONB NOT NULL,
    "total" DECIMAL(18,2) DEFAULT 0,
    "shipping" DECIMAL(18,2) DEFAULT 0,
    "discount" DECIMAL(18,2) DEFAULT 0,
    "tax" DECIMAL(18,2) DEFAULT 0,
    "grand_total" DECIMAL(18,2) DEFAULT 0,
    "status" VARCHAR(50) DEFAULT 'draft',
    "stage" VARCHAR(50),
    "note" TEXT,
    "target_date" DATE,
    "top" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "role_name" VARCHAR(100) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_otp" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "otp_code" VARCHAR(10) NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "is_used" BOOLEAN DEFAULT false,

    CONSTRAINT "user_otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" SERIAL NOT NULL,
    "company_name" VARCHAR(200) NOT NULL,
    "address" TEXT,
    "npwp" VARCHAR(50),
    "id_level" INTEGER,
    "note" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_level" (
    "id_level" SERIAL NOT NULL,
    "level_name" VARCHAR(100) NOT NULL,
    "disc1" DECIMAL(5,2) DEFAULT 0,
    "disc2" DECIMAL(5,2) DEFAULT 0,

    CONSTRAINT "company_level_pkey" PRIMARY KEY ("id_level")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "customer_name" VARCHAR(200) NOT NULL,
    "address" TEXT,
    "phone" VARCHAR(50),
    "email" VARCHAR(150),
    "type" VARCHAR(50),
    "company_id" INTEGER,
    "note" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_logs" (
    "id" BIGSERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "activity" VARCHAR(255) NOT NULL,
    "method" VARCHAR(10),
    "endpoint" TEXT,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "old_data" JSONB,
    "new_data" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "location" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_orders" (
    "id" BIGSERIAL NOT NULL,
    "do_no" VARCHAR(50) NOT NULL,
    "delivery_request_id" BIGINT NOT NULL,
    "sale_id" BIGINT NOT NULL,
    "status" VARCHAR(30) DEFAULT 'OPEN',
    "customer_po" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_requests" (
    "id" BIGSERIAL NOT NULL,
    "dr_no" VARCHAR(50) NOT NULL,
    "sale_id" BIGINT NOT NULL,
    "status" VARCHAR(30) DEFAULT 'OPEN',
    "note" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_approval" (
    "id" BIGSERIAL NOT NULL,
    "sale_id" BIGINT NOT NULL,
    "status" VARCHAR(30) DEFAULT 'PENDING',
    "note" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finance_approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_transactions" (
    "id" BIGSERIAL NOT NULL,
    "sale_id" BIGINT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "payment_status" VARCHAR(30) DEFAULT 'UNPAID',
    "note" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finance_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" BIGSERIAL NOT NULL,
    "po_no" VARCHAR(50) NOT NULL,
    "pr_id" BIGINT,
    "po_detail_items" JSONB NOT NULL,
    "total" DECIMAL(15,2) DEFAULT 0,
    "status" VARCHAR(30) DEFAULT 'DRAFT',
    "supplier_do" VARCHAR(255),
    "supplier_so" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_order_detail" (
    "id" BIGSERIAL NOT NULL,
    "sale_id" BIGINT NOT NULL,
    "product_id" BIGINT,
    "product_name" VARCHAR(255) NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "qty" INTEGER NOT NULL,
    "total" DECIMAL(15,2),
    "status" VARCHAR(30) DEFAULT 'ACTIVE',

    CONSTRAINT "sale_order_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_orders" (
    "id" BIGSERIAL NOT NULL,
    "sale_no" VARCHAR(50) NOT NULL,
    "quotation_id" INTEGER,
    "total" DECIMAL(15,2) DEFAULT 0,
    "discount" DECIMAL(15,2) DEFAULT 0,
    "shipping" DECIMAL(15,2) DEFAULT 0,
    "tax" DECIMAL(15,2) DEFAULT 0,
    "grand_total" DECIMAL(15,2) DEFAULT 0,
    "status" VARCHAR(30) DEFAULT 'DRAFT',
    "note" TEXT,
    "sale_status" VARCHAR(30) DEFAULT 'OPEN',
    "payment_status" VARCHAR(30) DEFAULT 'UNPAID',
    "file_po_customer" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "customer_id" INTEGER,

    CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_reservations" (
    "id" BIGSERIAL NOT NULL,
    "item_detail" JSONB NOT NULL,
    "lead_id" BIGINT,
    "type" VARCHAR(30),
    "status" VARCHAR(30) DEFAULT 'RESERVED',
    "note" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" BIGSERIAL NOT NULL,
    "supplier_name" VARCHAR(255) NOT NULL,
    "address" TEXT,
    "phone" VARCHAR(30),
    "email" VARCHAR(150),
    "type" VARCHAR(30),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses_history" (
    "id" BIGSERIAL NOT NULL,
    "wh_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "remark" VARCHAR(50),
    "qty" INTEGER NOT NULL,
    "part_number" VARCHAR(100),
    "supplier_id" BIGINT,
    "po_id" BIGINT,
    "do_id" BIGINT,
    "note" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" BIGINT,

    CONSTRAINT "warehouses_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_product_code_key" ON "products"("product_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_code_key" ON "warehouse"("code");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_orders_do_no_key" ON "delivery_orders"("do_no");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_requests_dr_no_key" ON "delivery_requests"("dr_no");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_po_no_key" ON "purchase_orders"("po_no");

-- CreateIndex
CREATE UNIQUE INDEX "sales_orders_sale_no_key" ON "sales_orders"("sale_no");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_otp" ADD CONSTRAINT "user_otp_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_id_level_fkey" FOREIGN KEY ("id_level") REFERENCES "company_level"("id_level") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_logs" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sale_order_detail" ADD CONSTRAINT "sale_order_detail_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
