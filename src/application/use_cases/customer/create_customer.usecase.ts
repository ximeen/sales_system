import { Customer } from "../../../domain/entities/customer.entity";
import type { CustomerRepository } from "../../../domain/repositories/customer.repository";
import { Address } from "../../../domain/value_objects/address.vo";
import { ValidationError } from "../../../shared/errors/application.errors";
import type { CreateCustomerDTO, CustomerOutputDTO } from "../../dtos/customer.dto";


export class CreateCustomerUseCase {
    constructor(private customerRepository: CustomerRepository){}

    async execute(dto: CreateCustomerDTO): Promise<CustomerOutputDTO>{
        if(!dto.name || dto.name.trim().length === 0){
            throw new ValidationError("Customer name is required");
        }
        if(!dto.email){
            throw new ValidationError("Customer email is required")
        }
         if(!dto.phone){
            throw new ValidationError("Customer phone is required")
        }
         if(!dto.document){
            throw new ValidationError("Customer document is required")
        }

        const existingCustomer = await this.customerRepository.findByEmail(
            dto.email,
            dto.tenantId
        )
        if(existingCustomer){
            throw new ValidationError("Customer with this email already exists")
        }

        const address = dto.address ? Address.create({
            street: dto.address.street,
            number: dto.address.number,
            complement: dto.address.complement,
            neighborhood: dto.address.neighborhood,
            city: dto.address.city,
            state: dto.address.city,
            zipCode: dto.address.zipCode,
            country: dto.address.country || "Brasil"
        }) : undefined;

        const customer = Customer.create(
            crypto.randomUUID(),
            dto.name,
            dto.email,
            dto.phone,
            dto.document,
            dto.tenantId,
            address,
            dto.secondaryPhone,
            dto.notes,
            dto.creditLimit
        )

        await this.customerRepository.save(customer);

        return this.toOutputDTO(customer)
    }
    private toOutputDTO(customer: Customer): CustomerOutputDTO {
        return {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            document: customer.document,
            documentType: customer.documentType,
            type: customer.type,
            isActive: customer.isActive,
            creditLimit: customer.creditLimit,
            currentDebt: customer.currentDebt,
            availableCredit: customer.availableCredit || undefined,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt,
        }
    }
}