import {
	boolean,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { customers } from "./customers";
import { addressTypeEnum } from "./enums";
import { relations } from "drizzle-orm";

export const customerAddresses = pgTable("customer_addresses", {
	id: uuid("id").primaryKey(),
	customerId: uuid("customer_id")
		.notNull()
		.references(() => customers.id, { onDelete: "cascade" }),
	type: addressTypeEnum("type").notNull().default("SHIPPING"),
	street: varchar("street", { length: 200 }).notNull(),
	number: varchar("number", { length: 200 }).notNull(),
	complement: varchar("complement", { length: 100 }),
	neighborhood: varchar("neighborhood", { length: 100 }).notNull(),
	city: varchar("city", { length: 100 }).notNull(),
	state: varchar("state", { length: 2 }).notNull(),
	zipCode: varchar("zip_code", { length: 8 }).notNull(),
	country: varchar("country", { length: 100 }).notNull().default("Brasil"),
	isDefault: boolean("is_default").notNull().default(false),
	isActive: boolean("is_active").notNull().default(true),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const customerAddressesRelations = relations(
	customerAddresses,
	({ one }) => ({
		customer: one(customers, {
			fields: [customerAddresses.customerId],
			references: [customers.id],
		}),
	}),
);

export type CustomerAddresses = typeof customerAddresses.$inferSelect;
export type NewCustomerAddresses = typeof customerAddresses.$inferSelect;
