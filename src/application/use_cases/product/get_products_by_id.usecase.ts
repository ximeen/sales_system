import type { Product } from "../../../domain/entities/product.entity";
import type { ProductRepository } from "../../../domain/repositories/product.repository";
import { NotFoundError } from "../../../shared/errors/application.errors";
import type { ProductOutputDTO } from "../../dtos/product.dto";


export class GetProductsByIdUseCase {
    constructor(
        private productRepository: ProductRepository
    ){}

    async execute(id: string, tenantId: string): Promise<ProductOutputDTO> {
        const aProduct = await this.productRepository.findById(id, tenantId);

        if(!aProduct) {
            throw new NotFoundError("Product", id)
        }
        return this.toOutputDTO(aProduct)
    }

    private toOutputDTO(product: Product): ProductOutputDTO{
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