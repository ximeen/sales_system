import {
	decimal,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { customerFinancial } from "./customer_financial";
import { relations } from "drizzle-orm";

export const customerFinancialHistory = pgTable("customer_financial_history", {
	id: uuid("id").primaryKey(),
	financialId: uuid("financial_id")
		.notNull()
		.references(() => customerFinancial.id, { onDelete: "cascade" }),
	changeType: varchar("change_type", { length: 50 }).notNull(),
	previousValue: decimal("previous_value", {
		precision: 10,
		scale: 2,
	}).notNull(),
	newValue: decimal("new_value", { precision: 10, scale: 2 }).notNull(),
	difference: decimal("difference", { precision: 10, scale: 2 }).notNull(),
	referenceId: uuid("refence_id"),
	reason: text("reason"),
	userId: uuid("user_id").notNull(),
	tenantId: uuid("tenant_id").notNull(),
	createdAt: timestamp().notNull().defaultNow(),
});

export const customerFinancialHistoryRelations = relations(
	customerFinancialHistory,
	({ one }) => ({
		financial: one(customerFinancial, {
			fields: [customerFinancialHistory.financialId],
			references: [customerFinancial.id],
		}),
	}),
);

export type CustomerFinanacialHistory =
	typeof customerFinancialHistory.$inferSelect;
export type NewCustomerFinanacialHistory =
	typeof customerFinancialHistory.$inferSelect;
