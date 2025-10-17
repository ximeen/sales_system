import type { ProductRepository } from "../../../domain/repositories/product.repository";
import type { StockRepository } from "../../../domain/repositories/stock.repository";
import { NotFoundError, ValidationError } from "../../../shared/errors/application.errors";
import type { AddStockDTO, StockOutputDTO } from "../../dtos/stock.dto";

export class AddStockUseCase {
    constructor(
        private stockRepository: StockRepository,
        private productRepository: ProductRepository
    ){}

    async execute(dto: AddStockDTO): Promise<StockOutputDTO> {
        if(dto.quantity <= 0){
            throw new ValidationError("Quantity must be greater than zero")
        }
        const product = await this.productRepository.findById(dto.productId, dto.tenantId);

        if(!product?.isActive){
            throw new ValidationError("Cannot add stock to inactive product")
        }

        const stock = await this.stockRepository.findById(dto.stockId);

        if(!stock){
            throw new NotFoundError("Stock", dto.stockId)
        }

        const movement = stock.increaseStock(dto.quantity, dto.userId);

        await this.stockRepository.save(stock)
        await this.stockRepository.saveMovement(movement);

        return this.toOutputDTO(stock)
    }

    private toOutputDTO(stock: any): StockOutputDTO {
        return {
            id: stock.id,
            productId: stock.productId,
            locationName: stock.locationName,
            locationCode: stock.locationCode,
            quantity: stock.quantity,
            availableQuantity: stock.availableQuantity,
            reservedQuantity: stock.reservedQuantity,
            minimumQuantity: stock.minimumQuantity,
            maximumQuantity: stock.maximumQuantity,
            isLowLevel: stock.isLowLevel(),
        }
    }
}