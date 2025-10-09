import type { Sale, SaleStatus } from "../entities/sale.entity";

export interface SaleRepository {
	save(sale: Sale): Promise<void>;
	findById(id: string, tenantId: string): Promise<Sale | null>;
	findByCustomer(customerId: string, tenantId: string): Promise<Sale[]>;
	findAll(tenantId: string, filters?: SaleFilters): Promise<Sale[]>;
	getTotalSalesByCustomer(
		customerId: string,
		tenantId: string,
	): Promise<number>;
	getTotalSaleByPeriod(
		startDate: Date,
		endDate: Date,
		tenantId: string,
	): Promise<number>;
	delete(id: string, tenantId: string): Promise<void>;
}

export interface SaleFilters {
	status?: SaleStatus;
	customerId?: string;
	userId?: string;
	startDate?: Date;
	endDate?: Date;
	minAmount?: number;
	maxAmount?: number;
	limit?: number;
	offset?: number;
}
