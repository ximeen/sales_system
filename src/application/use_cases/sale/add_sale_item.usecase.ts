import type { Sale } from "../../../domain/entities/sale.entity";
import type { ProductRepository } from "../../../domain/repositories/product.repository";
import type { SaleRepository } from "../../../domain/repositories/sale.repository";
import type { StockRepository } from "../../../domain/repositories/stock.repository";
import { Discount } from "../../../domain/value_objects/discount.vo";
import { BussinessRuleError, NotFoundError, ValidationError } from "../../../shared/errors/application.errors";
import type { AddSaleItemDTO, SaleOutputDTO } from "../../dtos/sale.dto";


export class AddSaleItemUseCase {
    constructor(
        private saleRepository: SaleRepository,
        private productRepository: ProductRepository,
        private stockRepository: StockRepository
    ){}
    async execute(dto: AddSaleItemDTO): Promise<SaleOutputDTO> {
        if(dto.quantity <= 0){
            throw new ValidationError("Quantity must be greater than zero")
        }

        const sale = await this.saleRepository.findById(dto.saleId, dto.tenantId);

        if(!sale){
            throw new NotFoundError("Sale", dto.saleId)
        }

        if(!sale.isDraft){
            throw new BussinessRuleError("Cannot add items to non draft sale")
        }

        const product = await this.productRepository.findById(dto.productId, dto.tenantId)

        if(!product){
            throw new NotFoundError("Product", dto.productId)
        }
        if(!product.isActive){
            throw new ValidationError("Cannot add inactive product to sale")
        }

        const totalStock = await this.stockRepository.getTotalStockByProduct(dto.productId, dto.tenantId)
        
        if(totalStock < dto.quantity){
            throw new BussinessRuleError(`Insuficient stock. Availabe: ${totalStock}, Requested: ${dto.quantity}`)
        }

        let discount: Discount | undefined;
        
        if(dto.discountPercentage) {
            discount = Discount.createPercentage(dto.discountPercentage)
        }
        if(dto.discountFixed){
            discount = Discount.createFixed(dto.discountFixed)
        }

        sale.addItem(
            product.id,
            product.name,
            product.sku,
            dto.quantity,
            product.price,
            discount
        )

        await this.saleRepository.save(sale);
        
        return this.toOutputDTO(sale);
    }

    private toOutputDTO(sale: Sale): SaleOutputDTO {
        return {
            id: sale.id,
            customerId: sale.customerId,
            customerName: sale.customerName,
            status: sale.status,
            items: sale.items.map(item => ({
                id: item.id,
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: item.discountAmount,
                total: item.total,
            })),
            subtotal: sale.subtotal,
            discountAmount: sale.discountAmount,
            total: sale.total,
            totalPaid: sale.totalPaid,
            remainingAmount: sale.remainingAmount,
            createdAt: sale.createdAt,
            updatedAt: sale.updatedAt,
        }
    }
}