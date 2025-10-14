import { relations } from "drizzle-orm";
import {
	boolean,
	decimal,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { stocks } from "./stocks";
import { saleItems } from "./sale_items";

export const products = pgTable("products", {
	id: uuid("id").primaryKey(),
	name: varchar("name", { length: 200 }).notNull(),
	description: text("description"),
	sku: varchar("sku", { length: 50 }).notNull(),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
	costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
	isActive: boolean("is_active").notNull().default(true),
	categoryId: uuid("category_id"),
	tenantId: uuid("tenant_id").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const productsRelations = relations(products, ({ many }) => ({
	stocks: many(stocks),
	saleItems: many(saleItems),
}));

export type Products = typeof products.$inferSelect;
export type NewProducts = typeof products.$inferSelect;
