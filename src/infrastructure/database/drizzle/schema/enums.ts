import { pgEnum } from "drizzle-orm/pg-core";

export const locationTypeEnum = pgEnum("location_type", [
	"WAREHOUSE",
	"STORE",
	"OTHER",
]);
export const movementTypeEnum = pgEnum("movement_type", [
	"IN",
	"OUT",
	"ADJUSTMENT",
	"TRANSFER",
]);
export const movementReasonEnum = pgEnum("movement_reason", [
	"PURCHASE",
	"SALE",
	"RETURN",
	"ADJUSTMENT",
	"TRANSFER_IN",
	"TRANSFER_OUT",
	"LOSS",
	"DAMAGED",
]);

export const customerTypeEnum = pgEnum("customer_type", [
	"INDIVIDUAL",
	"BUSINESS",
]);

export const addressTypeEnum = pgEnum("address_type", [
	"BILLING",
	"SHIPPING",
	"OTHER",
]);
export const saleStatusEnum = pgEnum("sale_status", [
	"DRAFT",
	"CONFIRMED",
	"PAID",
	"CANCELLED",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
	"CASH",
	"CREDIT_CARD",
	"DEBIT_CARD",
	"PIX",
	"BANK_SLIP",
	"CREDIT",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
	"PENDING",
	"CONFIRMED",
	"CANCELLED",
]);
export const discountTypeEnum = pgEnum("discount_type", [
	"PERCENTAGE",
	"FIXED",
]);
