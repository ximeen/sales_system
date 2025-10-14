import { decimal, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { customers } from "./customers";
import { relations } from "drizzle-orm";
import { customerFinancialHistory } from "./customer_financial_history";

export const customerFinancial = pgTable("customer_financial", {
	id: uuid("id").primaryKey(),
	customerId: uuid("customer_id")
		.notNull()
		.references(() => customers.id, { onDelete: "cascade" })
		.unique(),
	creditLimit: decimal("credit_limt", { precision: 10, scale: 2 }),
	currentDebt: decimal("current_debt", { precision: 10, scale: 2 })
		.notNull()
		.default("0"),
	tenantId: uuid("tenant_id").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const customerFinancail = relations(
	customerFinancial,
	({ one, many }) => ({
		customer: one(customers, {
			fields: [customerFinancial.customerId],
			references: [customers.id],
		}),
		history: many(customerFinancialHistory),
	}),
);

export type CustomerFinancial = typeof customerFinancial.$inferSelect;
export type NewCustomerFinancial = typeof customerFinancial.$inferSelect;
