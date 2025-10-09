import type { Stock } from "../entities/stock.entity";
import type {
	MovementReasons,
	MovementType,
	StockMovement,
} from "../entities/stock_movement.entity";

export interface StockRepository {
	save(stock: Stock): Promise<void>;
	saveMovement(movement: StockMovement): Promise<void>;
	findById(id: string): Promise<Stock | null>;
	findByProductAndLocation(
		productId: string,
		locationCode: string,
		tenantId: string,
	): Promise<Stock | null>;
	findByProduct(productId: string, tenantId: string): Promise<Stock[]>;
	findByLocation(locationId: string, tenantId: string): Promise<Stock[]>;
	findByLowLevelStock(tenantId: string): Promise<Stock[]>;
	getMovementHistory(
		stockId: string,
		tenantId: string,
		filters?: MovementFilters,
	): Promise<StockMovement[]>;
	getTotalStockByProduct(id: string, tenantId: string): Promise<number>;
	delete(id: string, tenantId: string): Promise<void>;
}

export interface MovementFilters {
	type?: MovementType;
	reasons?: MovementReasons;
	startsDate?: Date;
	endDate?: Date;
	limit?: number;
	offset?: number;
}
