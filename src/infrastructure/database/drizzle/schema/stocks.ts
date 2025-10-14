import {
	integer,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { products } from "./products";
import { locationTypeEnum } from "./enums";
import { relations } from "drizzle-orm";
import { stockMovements } from "./stock_movements";

export const stocks = pgTable("stocks", {
	id: uuid("id").primaryKey(),
	productId: uuid("product_id")
		.notNull()
		.references(() => products.id),
	locationName: varchar("location_name", { length: 100 }).notNull(),
	locationCode: varchar("location_code", { length: 50 }).notNull(),
	locationType: locationTypeEnum("location_type")
		.notNull()
		.default("WAREHOUSE"),
	quantity: integer("quantity").notNull().default(0),
	minimumQuantity: integer("minimum_quantity").notNull().default(0),
	maximumQuantity: integer("maximum_quantity"),
	reservedQuantity: integer("reserved_quantity").notNull().default(0),
	tenantId: uuid("tenant_id").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const stockRelations = relations(stocks, ({ one, many }) => ({
	products: one(products, {
		fields: [stocks.productId],
		references: [products.id],
	}),
	movements: many(stockMovements),
}));

export type Stock = typeof stocks.$inferSelect;
export type NewStock = typeof stocks.$inferSelect;
