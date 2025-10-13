import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { stocks } from "./stocks";
import { products } from "./products";
import { movementReasonEnum, movementTypeEnum } from "./enums";
import { relations } from "drizzle-orm";

export const stockMovements = pgTable("stock_movements", {
	id: uuid("id").primaryKey(),
	stockId: uuid("stock_id")
		.notNull()
		.references(() => stocks.id),
	productId: uuid("product_id")
		.notNull()
		.references(() => products.id),
	type: movementTypeEnum("type").notNull().default("OUT"),
	reason: movementReasonEnum("reason").notNull().default("SALE"),
	quantity: integer("quantity").notNull().default(0),
	previousQuantity: integer("previous_quantity").notNull(),
	currentQuantity: integer("current_quantity").notNull(),
	referenceId: uuid("reference_id"),
	notes: text("notes"),
	userId: uuid("user_id").notNull(),
	tenantId: uuid("tenant_id").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
	stock: one(stocks, {
		fields: [stockMovements.stockId],
		references: [stocks.id],
	}),
	product: one(products, {
		fields: [stockMovements.productId],
		references: [products.id],
	}),
}));

export type StockMovements = typeof stockMovements.$inferSelect;
export type NewStockMovements = typeof stockMovements.$inferSelect;
