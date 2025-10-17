import { Product } from "../../../domain/entities/product.entity";
import type { ProductRepository } from "../../../domain/repositories/product.repository";
import { ValidationError } from "../../../shared/errors/application.errors";
import type { CreateProductDTO, ProductOutputDTO } from "../../dtos/product.dto";


export class CreateProductUseCase {
    constructor(private productRepository: ProductRepository){}

    async execute(dto: CreateProductDTO): Promise<ProductOutputDTO> {
        if(!dto.name || dto.name.trim().length === 0){
            throw new ValidationError("Product name is required")
        }

        if(!dto.sku || dto.sku.trim().length === 0){
            throw new ValidationError("Product SKU is required")
        }

        if(dto.price <= 0){
            throw new ValidationError("Product price must be greater than zero")
        }

        const existingProduct = await this.productRepository.findBySku(dto.sku, dto.tenantId)

        if(existingProduct){
            throw new ValidationError("Product with SKU already exists")
        }

        const product = Product.create(
            crypto.randomUUID(),
            dto.name,
            dto.sku,
            dto.price,
            dto.tenantId,
            dto.description,
            dto.costPrice,
            dto.categoryId
        )

        await this.productRepository.save(product);
        return this.toOutputDTO(product)
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