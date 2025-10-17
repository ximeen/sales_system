import type { ProductRepository } from "../../../domain/repositories/product.repository";
import type { ListProductsDTO, ProductOutputDTO } from "../../dtos/product.dto";

export class ListProductsUseCase {
	constructor(private productRepository: ProductRepository) {}

	async execute(
		tenantId: string,
		filters?: ListProductsDTO,
	): Promise<ProductOutputDTO> {
		const products = await this.productRepository.findAll(tenantId, filters);

		return products.map((product) => ({
			id: product.id,
			name: product.name,
			description: product.description,
			sku: product.sku,
			price: product.price,
			costPrice: product.costPrice,
			isActive: product.isActive,
			categoryId: product.categoryId,
			profitMargin: product.calculateProfitMargin() || undefined,
			tenantId: product.tenantId,
			createdAt: product.createdAt,
			updatedAt: product.updatedAt,
		}));
	}
}
