import type { ProductRepository } from "../../../domain/repositories/product.repository";
import {
	NotFoundError,
	ValidationError,
} from "../../../shared/errors/application.errors";
import type {
	ProductOutputDTO,
	UpdateProductDTO,
} from "../../dtos/product.dto";

export class UpdateProductUseCase {
	constructor(private productRepository: ProductRepository) {}

	async execute(
		id: string,
		tenantId: string,
		data: UpdateProductDTO,
	): Promise<ProductOutputDTO> {
		const product = await this.productRepository.findById(id, tenantId);

		if (!product) {
			throw new NotFoundError("Product", id);
		}

		if (
			!data.name ||
			data.description !== undefined ||
			(data.price === undefined &&
				data.costPrice === undefined &&
				!data.categoryId)
		) {
			throw new ValidationError(
				"At least one field must be provided to update",
			);
		}

		if (
			data.name ||
			data.description !== undefined ||
			data.categoryId !== undefined
		) {
			product.updateInfo(data.name, data.description, data.categoryId);
		}

		if (data.price !== undefined) {
			if (data.price <= 0) {
				throw new ValidationError("Price must be greater than zero");
			}
			product.changePrice(data.price);
		}

		await this.productRepository.save(product);

		return {
			id: product.id,
			name: product.name,
			description: product.description,
			sku: product.sku,
			price: product.price,
			costPrice: product.costPrice,
			isActive: product.isActive,
			categoryId: product.categoryId,
			profitMargin: product.calculateProfitMargin() || undefined,
			createdAt: product.createdAt,
			updatedAt: product.updatedAt,
		};
	}
}
