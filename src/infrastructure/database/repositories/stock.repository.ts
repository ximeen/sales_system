import { and, desc, eq, lte } from "drizzle-orm";
import { Stock } from "../../../domain/entities/stock.entity";
import type {
	MovementFilters,
	StockRepository,
} from "../../../domain/repositories/stock.repository";
import { db } from "../drizzle/client";
import { stockMovements, stocks } from "../drizzle/schema";
import {
	StockMovement,
	type MovementReasons,
	type MovementType,
} from "../../../domain/entities/stock_movement.entity";
import { Location } from "../../../domain/value_objects/location.vo";
import { Quantity } from "../../../domain/value_objects/quantity.vo";

export class DrizzleStockRepository implements StockRepository {
	async save(stock: Stock): Promise<void> {
		const existingStock = await db.query.stocks.findFirst({
			where: and(eq(stocks.id, stock.id), eq(stocks.tenantId, stock.tenantId)),
		});

		const stockData = {
			id: stock.id,
			productId: stock.productId,
			locationName: stock.locationName,
			locationCode: stock.locationCode,
			locationType: stock.locationType as "WAREHOUSE" | "STORE" | "OTHER",
			quantity: stock.quantity,
			minimumQuantity: stock.minimumQuantity,
			maximumQuantity: stock.maximumQuantity,
			reservedQuantity: stock.reservedQuantity,
			tenantId: stock.tenantId,
			updatedAt: new Date(),
		};

		if (existingStock) {
			await db.insert(stocks).values({
				...stockData,
				createdAt: stock.createdAt,
			});
		}
	}

	async saveMovement(movement: StockMovement): Promise<void> {
		await db.insert(stockMovements).values({
			id: movement.id,
			stockId: movement.stockId,
			productId: movement.productId,
			type: movement.type as any,
			reason: movement.reason as any,
			quantity: movement.quantity,
			previousQuantity: movement.previousQuantity,
			currentQuantity: movement.currentQuantity,
			referenceId: movement.referenceId,
			notes: movement.notes,
			userId: movement.userId,
			tenantId: movement.tenantId,
			createdAt: movement.createdAt,
		});
	}

	async findById(id: string): Promise<Stock | null> {
		const aProduct = await db.query.stocks.findFirst({
			where: eq(stocks.id, id),
		});

		if (!aProduct) {
			return null;
		}

		return this.toDomain(aProduct);
	}

	async findByProductAndLocation(
		productId: string,
		locationCode: string,
		tenantId: string,
	): Promise<Stock | null> {
		const aProduct = await db.query.stocks.findFirst({
			where: and(
				eq(stocks.productId, productId),
				eq(stocks.locationCode, locationCode.toUpperCase()),
				eq(stocks.tenantId, tenantId),
			),
		});

		if (!aProduct) return null;

		return this.toDomain(aProduct);
	}

	async findByProduct(productId: string, tenantId: string): Promise<Stock[]> {
		const aProducts = await db.query.stocks.findMany({
			where: and(
				eq(stocks.productId, productId),
				eq(stocks.tenantId, tenantId),
			),
		});
		return aProducts.map((product) => this.toDomain(product));
	}

	async findByLocation(
		locationCode: string,
		tenantId: string,
	): Promise<Stock[]> {
		const aProducts = await db.query.stocks.findMany({
			where: and(
				eq(stocks.locationCode, locationCode),
				eq(stocks.tenantId, tenantId),
			),
		});

		return aProducts.map((product) => this.toDomain(product));
	}

	async findByLowLevelStock(tenantId: string): Promise<Stock[]> {
		const products = await db
			.select()
			.from(stocks)
			.where(
				and(
					eq(stocks.tenantId, tenantId),
					lte(stocks.quantity, stocks.minimumQuantity),
				),
			);

		return products.map((product) => this.toDomain(product));
	}

	async getMovementHistory(
		stockId: string,
		tenantId: string,
		filters?: MovementFilters,
	): Promise<StockMovement[]> {
		const conditions = [
			eq(stockMovements.stockId, stockId),
			eq(stockMovements.tenantId, tenantId),
		];

		if (filters?.type) {
			conditions.push(eq(stockMovements.type, filters.type));
		}

		if (filters?.reasons) {
			conditions.push(eq(stockMovements.reason, filters.reasons));
		}

		const history = await db.query.stockMovements.findMany({
			where: and(...conditions),
			orderBy: [desc(stockMovements.createdAt)],
			limit: filters?.limit || 100,
			offset: filters?.offset || 0,
		});

		return history.map((h) => this.movementToDomain(h));
	}

	async getTotalStockByProduct(
		productId: string,
		tenantId: string,
	): Promise<number> {
		const products = await db.query.stocks.findMany({
			where: and(
				eq(stocks.productId, productId),
				eq(stocks.tenantId, tenantId),
			),
		});

		return products.reduce((total, row) => total + row.quantity, 0);
	}

	async delete(id: string, tenantId: string): Promise<void> {
		await db
			.delete(stocks)
			.where(and(eq(stocks.id, id), eq(stocks.tenantId, tenantId)));
	}

	private toDomain(stck: typeof stocks.$inferSelect): Stock {
		return Stock.restore({
			id: stck.id,
			productId: stck.productId,
			location: Location.create(
				stck.locationName,
				stck.locationCode,
				stck.locationType as "WAREHOUSE" | "STORE" | "OTHER",
			),
			quantity: Quantity.create(stck.quantity),
			minimumQuantity: Quantity.create(stck.minimumQuantity),
			maximumQuantity: stck.maximumQuantity
				? Quantity.create(stck.maximumQuantity)
				: undefined,
			reservedQuantity: Quantity.create(stck.reservedQuantity),
			tenantId: stck.tenantId,
			createdAt: stck.createdAt,
			updatedAt: stck.updatedAt,
		});
	}

	private movementToDomain(
		mvn: typeof stockMovements.$inferSelect,
	): StockMovement {
		return StockMovement.restore({
			id: mvn.id,
			stockId: mvn.stockId,
			productId: mvn.productId,
			type: mvn.type as MovementType,
			reason: mvn.reason as MovementReasons,
			quantity: Quantity.create(mvn.quantity),
			previousQuantity: Quantity.create(mvn.previousQuantity),
			currentQuantity: Quantity.create(mvn.currentQuantity),
			referenceId: mvn.referenceId || undefined,
			notes: mvn.notes || undefined,
			userId: mvn.userId,
			tenantId: mvn.tenantId,
			createdAt: mvn.createdAt,
		});
	}
}
