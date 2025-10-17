import { Sale } from "../../../domain/entities/sale.entity";
import type { CustomerRepository } from "../../../domain/repositories/customer.repository";
import type { SaleRepository } from "../../../domain/repositories/sale.repository";
import { NotFoundError, ValidationError } from "../../../shared/errors/application.errors";
import type { CreateSaleDTO, SaleOutputDTO } from "../../dtos/sale.dto";

export class CreateSaleUseCase {
    constructor(
        private saleRepository: SaleRepository,
        private customerRepository: CustomerRepository
    ){}

    async execute(dto: CreateSaleDTO): Promise<SaleOutputDTO> {
        const customer = await this.customerRepository.findById(dto.customerId, dto.tenantId)

        if(!customer){
            throw new NotFoundError("Customer", dto.customerId)
        }
        if(!customer.isActive){
            throw new ValidationError("Cannot create sale for inactive customer")
        }
        const sale = Sale.create(
            crypto.randomUUID(),
            customer.id,
            customer.name,
            dto.userId,
            dto.tenantId,
            dto.notes
        )

        await this.saleRepository.save(sale)
        return this.toOutputDTO(sale)
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