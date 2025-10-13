import { decimal, integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { sales } from "./sales";
import { products } from "./products";
import { discountTypeEnum } from "./enums";
import { relations } from "drizzle-orm";

export const saleItems = pgTable("sale_items", {
	id: uuid("id").primaryKey(),
	saleId: uuid("sale_id")
		.notNull()
		.references(() => sales.id, { onDelete: "cascade" }),
	productId: uuid("product_id")
		.notNull()
		.references(() => products.id),
	productName: varchar("product_name", { length: 200 }).notNull(),
	productSku: varchar("product_sku", { length: 50 }).notNull(),
	quantity: integer("quantity").notNull(),
	unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
	discountType: discountTypeEnum("discount_type"),
	discountValue: decimal("discount_value", { precision: 10, scale: 2 }),
	subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
	total: decimal("total", { precision: 10, scale: 2 }).notNull(),
});

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
	sale: one(sales, {
		fields: [saleItems.saleId],
		references: [sales.id],
	}),
	product: one(products, {
		fields: [saleItems.productId],
		references: [products.id],
	}),
}));

export type SaleItem = typeof saleItems.$inferSelect;
export type NewSaleItem = typeof saleItems.$inferSelect;
