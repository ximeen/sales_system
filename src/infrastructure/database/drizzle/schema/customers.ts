import {
	boolean,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { customerTypeEnum } from "./enums";
import { relations } from "drizzle-orm";
import { sales } from "./sales";
import { customerAddresses } from "./customer_addresses";
import { customerFinancial } from "./customer_financial";

export const customers = pgTable("customers", {
	id: uuid("id").primaryKey(),
	name: varchar("name", { length: 200 }).notNull(),
	email: varchar("email", { length: 200 }).notNull(),
	phone: varchar("phone", { length: 200 }).notNull(),
	document: varchar("document", { length: 20 }).notNull().unique(),
	type: customerTypeEnum("type").notNull(),
	secondayPhone: varchar("secondary_phone", { length: 20 }),
	notes: varchar("notes"),
	isActive: boolean("is_active").notNull().default(true),
	tenantId: uuid("tenant_id").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const customersRelations = relations(customers, ({ many, one }) => ({
	sales: many(sales),
	addresses: many(customerAddresses),
	financial: one(customerFinancial, {
		fields: [customers.id],
		references: [customerFinancial.customerId],
	}),
}));

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
