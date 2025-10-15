CREATE TYPE "public"."address_type" AS ENUM('BILLING', 'SHIPPING', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."customer_type" AS ENUM('INDIVIDUAL', 'BUSINESS');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('PERCENTAGE', 'FIXED');--> statement-breakpoint
CREATE TYPE "public"."location_type" AS ENUM('WAREHOUSE', 'STORE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."movement_reason" AS ENUM('PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'LOSS', 'DAMAGED');--> statement-breakpoint
CREATE TYPE "public"."movement_type" AS ENUM('IN', 'OUT', 'ADJUSTMENT', 'TRANSFER');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BANK_SLIP', 'CREDIT');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'CONFIRMED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."sale_status" AS ENUM('DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"sku" varchar(50) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"cost_price" numeric(10, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"category_id" uuid,
	"tenant_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stocks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"product_id" uuid NOT NULL,
	"location_name" varchar(100) NOT NULL,
	"location_code" varchar(50) NOT NULL,
	"location_type" "location_type" DEFAULT 'WAREHOUSE' NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"minimum_quantity" integer DEFAULT 0 NOT NULL,
	"maximum_quantity" integer,
	"reserved_quantity" integer DEFAULT 0 NOT NULL,
	"tenant_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY NOT NULL,
	"stock_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"type" "movement_type" DEFAULT 'OUT' NOT NULL,
	"reason" "movement_reason" DEFAULT 'SALE' NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"previous_quantity" integer NOT NULL,
	"current_quantity" integer NOT NULL,
	"reference_id" uuid,
	"notes" text,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" varchar(200) NOT NULL,
	"phone" varchar(200) NOT NULL,
	"document" varchar(20) NOT NULL,
	"type" "customer_type" NOT NULL,
	"secondary_phone" varchar(20),
	"notes" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"tenant_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_document_unique" UNIQUE("document")
);
--> statement-breakpoint
CREATE TABLE "customer_addresses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"customer_id" uuid NOT NULL,
	"type" "address_type" DEFAULT 'SHIPPING' NOT NULL,
	"street" varchar(200) NOT NULL,
	"number" varchar(200) NOT NULL,
	"complement" varchar(100),
	"neighborhood" varchar(100) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(2) NOT NULL,
	"zip_code" varchar(8) NOT NULL,
	"country" varchar(100) DEFAULT 'Brasil' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_financial" (
	"id" uuid PRIMARY KEY NOT NULL,
	"customer_id" uuid NOT NULL,
	"credit_limt" numeric(10, 2),
	"current_debt" numeric(10, 2) DEFAULT '0' NOT NULL,
	"tenant_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customer_financial_customer_id_unique" UNIQUE("customer_id")
);
--> statement-breakpoint
CREATE TABLE "customer_financial_history" (
	"id" uuid PRIMARY KEY NOT NULL,
	"financial_id" uuid NOT NULL,
	"change_type" varchar(50) NOT NULL,
	"previous_value" numeric(10, 2) NOT NULL,
	"new_value" numeric(10, 2) NOT NULL,
	"difference" numeric(10, 2) NOT NULL,
	"refence_id" uuid,
	"reason" text,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" uuid PRIMARY KEY NOT NULL,
	"customer_id" uuid NOT NULL,
	"customer_name" varchar(200) NOT NULL,
	"status" "sale_status" DEFAULT 'DRAFT' NOT NULL,
	"discount_type" "discount_type",
	"discount_value" numeric(10, 2),
	"subtotal" numeric(10, 2) NOT NULL,
	"discount_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"notes" text,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"confirmed_at" timestamp,
	"paid_at" timestamp,
	"cancelled_at" timestamp,
	"cancellation_reason" text
);
--> statement-breakpoint
CREATE TABLE "sale_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"sale_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"product_name" varchar(200) NOT NULL,
	"product_sku" varchar(50) NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"discount_type" "discount_type",
	"discount_value" numeric(10, 2),
	"subtotal" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"sale_id" uuid NOT NULL,
	"method" "payment_method" NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"paid_at" timestamp,
	"transaction_id" varchar(200),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_stock_id_stocks_id_fk" FOREIGN KEY ("stock_id") REFERENCES "public"."stocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_financial" ADD CONSTRAINT "customer_financial_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_financial_history" ADD CONSTRAINT "customer_financial_history_financial_id_customer_financial_id_fk" FOREIGN KEY ("financial_id") REFERENCES "public"."customer_financial"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;