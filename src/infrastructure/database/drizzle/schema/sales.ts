import {
	decimal,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { customers } from "./customers";
import { discountTypeEnum, saleStatusEnum } from "./enums";
import { relations } from "drizzle-orm";

export const sales = pgTable("sales", {
	id: uuid("id").primaryKey(),
	customerId: uuid("customer_id")
		.notNull()
		.references(() => customers.id),
	customerName: varchar("customer_name", { length: 200 }).notNull(),
	status: saleStatusEnum("status").notNull().default("DRAFT"),
	discountType: discountTypeEnum("discount_type"),
	discountValue: decimal("discount_value", { precision: 10, scale: 2 }),
	subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
	discountAmount: decimal("discount_amount", { precision: 10, scale: 2 })
		.notNull()
		.default("0"),
	total: decimal("total", { precision: 10, scale: 2 }).notNull(),
	notes: text("notes"),
	userId: uuid("user_id").notNull(),
	tenantId: uuid("tenant_id").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("created_at").notNull().defaultNow(),
	confirmedAt: timestamp("confirmed_at"),
	paidAt: timestamp("paid_at"),
	cancelledAt: timestamp("cancelled_at"),
	cancellationReason: text("cancellation_reason"),
});

export const salesRelations = relations(sales, ({ one, many }) => ({
	customer: one(customers, {
		fields: [sales.customerId],
		references: [customers.id],
	}),
	items: many(saleItems),
	payments: many(payments),
}));

export type Sale = typeof sales.$inferSelect;

export type NewSale = typeof sales.$inferSelect;
