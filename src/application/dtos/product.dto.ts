export interface CreateProductDTO {
	name: string;
	description?: string;
	sku: string;
	price: number;
	costPrice?: number;
	categoryId?: string;
	tenantId: string;
}

export interface UpdateProductDTO {
	id: string;
	name?: string;
	description?: string;
	price?: number;
	costPrice?: number;
	categoryId?: string;
	tenantId: string;
}

export interface ProductOutputDTO {
	id: string;
	name: string;
	description?: string;
	sku: string;
	price: number;
	costPrice?: number;
	isActive: boolean;
	categoryId?: string;
	profitMargin?: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface ListProductsDTO {
	isActive?: boolean;
	categoryId?: string;
	search?: string;
	limit?: number;
	offset?: number;
}

