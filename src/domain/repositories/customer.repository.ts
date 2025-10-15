import type { Customer, CustomerType } from "../entities/customer.entity";

export interface CustomerRepository {
	save(customer: Customer): Promise<void>;
	findById(id: string, tenantId: string): Promise<Customer | null>;
	findByDocument(document: string, tenantId: string): Promise<Customer | null>;
	findByEmail(email: string, tenantId: string): Promise<Customer | null>;
	findAll(tenantId: string, filters?: CustomerFilters): Promise<Customer[]>;
	findWithDebt(tenantId: string): Promise<Customer[]>;
	delete(id: string, tenantId: string): Promise<void>;
}

export interface CustomerFilters {
	isActive?: boolean;
	type?: CustomerType;
	search?: string;
	hasDebt?: boolean;
	limit?: number;
	offset?: number;
}
