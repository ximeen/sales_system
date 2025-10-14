import {
	decimal,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { sales } from "./sales";
import { paymentMethodEnum, paymentStatusEnum } from "./enums";
import { relations } from "drizzle-orm";

export const payments = pgTable("payments", {
	id: uuid("id").primaryKey(),
	saleId: uuid("sale_id")
		.notNull()
		.references(() => sales.id, { onDelete: "cascade" }),
	method: paymentMethodEnum("method").notNull(),
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	status: paymentStatusEnum("status").notNull().default("PENDING"),
	paidAt: timestamp("paid_at"),
	transactionId: varchar("transaction_id", { length: 200 }),
	notes: text("notes"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
	sale: one(sales, {
		fields: [payments.saleId],
		references: [sales.id],
	}),
}));

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
