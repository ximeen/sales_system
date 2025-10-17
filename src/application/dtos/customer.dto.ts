export interface CreateCustomerDTO {
	name: string;
	email: string;
	phone: string;
	document: string;
	tenantId: string;
	address?: {
		street: string;
		number: string;
		complement?: string;
		neighborhood: string;
		city: string;
		state: string;
		zipCode: string;
		country?: string;
	};
	secondaryPhone?: string;
	notes?: string;
	creditLimit?: number;
}

export interface UpdateCustomerDTO {
	id: string;
	name?: string;
	email?: string;
	phone?: string;
	secondaryPhone?: string;
	notes?: string;
	tenantId: string;
}

export interface CustomerOutputDTO {
	id: string;
	name: string;
	email: string;
	phone: string;
	document: string;
	documentType: string;
	type: string;
	isActive: boolean;
	creditLimit?: number;
	currentDebt: number;
	availableCredit?: number;
	createdAt: Date;
	updatedAt: Date;
}

