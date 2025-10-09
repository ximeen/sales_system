import type { Product } from "../entities/product.entity";

export interface ProductRepository {
	save(product: Product): Promise<void>;
	findById(id: string, tenantId: string): Promise<Product | null>;
	findBySku(sku: string, tenantId: string): Promise<Product | null>;
	findAll(tenantId: string, filters?: ProductFilters): Promise<Product[]>;
}

export interface ProductFilters {
	isActive?: boolean;
	categoryId?: string;
	search?: string;
	limit?: number;
	offset?: number;
}
