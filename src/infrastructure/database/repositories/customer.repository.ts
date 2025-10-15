import { and, desc, eq, gt, like, or } from "drizzle-orm";
import { Customer } from "../../../domain/entities/customer.entity";
import type {
	CustomerFilters,
	CustomerRepository,
} from "../../../domain/repositories/customer.repository";
import { db } from "../drizzle/client";
import {
	customerAddresses,
	customerFinancial,
	customers,
} from "../drizzle/schema";
import { Address } from "../../../domain/value_objects/address.vo";
import { Email } from "../../../domain/value_objects/email.vo";
import { Phone } from "../../../domain/value_objects/phone.vo";
import { Document } from "../../../domain/value_objects/document.vo";

export class DrizzleCustomerRepository implements CustomerRepository {
	async save(customer: Customer): Promise<void> {
		const existingCustomer = await db.query.customers.findFirst({
			where: and(
				eq(customers.id, customer.id),
				eq(customers.tenantId, customer.tenantId),
			),
		});

		const customerData = {
			id: customer.id,
			name: customer.name,
			email: customer.email,
			phone: customer.email,
			document: customer.document,
			type: customer.type as "INDIVIDUAL" | "BUSINESS",
			secondaryPhone: customer.secondaryPhone,
			notes: customer.notes,
			isActive: customer.isActive,
			tenantId: customer.tenantId,
			updatedAt: new Date(),
		};

		if (existingCustomer) {
			await db
				.update(customers)
				.set(customerData)
				.where(
					and(
						eq(customers.id, customer.id),
						eq(customers.tenantId, customer.tenantId),
					),
				);
		}

		await db.insert(customers).values({
			...customerData,
			createdAt: customer.createdAt,
		});

		await this.saveFinancialData(customer);

		if (customer.address) {
			await this.saveAddress(customer.id, customer.address, customer.tenantId);
		}
	}

	private async saveFinancialData(customer: Customer): Promise<void> {
		const existingFinancial = await db.query.customerFinancial.findFirst({
			where: eq(customerFinancial.id, customer.id),
		});

		const financialData = {
			customerId: customer.id,
			creditLimit: customer.creditLimit?.toString(),
			currentDebt: customer.currentDebt.toString(),
			tenantId: customer.tenantId,
			updatedAt: new Date(),
		};

		if (existingFinancial) {
			await db
				.update(customerFinancial)
				.set(financialData)
				.where(eq(customerFinancial.id, customer.id));
		}

		await db.insert(customerFinancial).values({
			id: crypto.randomUUID(),
			...financialData,
			createdAt: new Date(),
		});
	}

	private async saveAddress(
		customerId: string,
		address: Address,
		tenantId: string,
	): Promise<void> {
		const existingAddress = await db.query.customerAddresses.findFirst({
			where: and(
				eq(customerAddresses.customerId, customerId),
				eq(customerAddresses.isDefault, true),
			),
		});

		const addressData = {
			customerId,
			type: "SHIPPING" as const,
			street: address.street,
			number: address.number,
			complement: address.complement,
			neighborhood: address.neighborhood,
			city: address.city,
			state: address.state,
			zipCode: address.zipCode,
			country: address.country,
			isDefault: true,
			isActive: true,
			updatedAt: new Date(),
		};

		if (existingAddress) {
			await db
				.update(customerAddresses)
				.set(addressData)
				.where(eq(customerAddresses.id, existingAddress.id));
		}

		await db.insert(customerAddresses).values({
			id: crypto.randomUUID(),
			...addressData,
			createdAt: new Date(),
		});
	}

	async findById(id: string, tenantId: string): Promise<Customer | null> {
		const aCustomer = await db.query.customers.findFirst({
			where: and(eq(customers.id, id), eq(customers.tenantId, tenantId)),
			with: {
				financial: true,
				addresses: {
					where: eq(customerAddresses.isDefault, true),
				},
			},
		});

		if (!aCustomer) return null;

		return this.toDomain(aCustomer);
	}

	async findByDocument(
		document: string,
		tenantId: string,
	): Promise<Customer | null> {
		const cleanedDocument = document.replace(/\D/g, "");
		const aCustomer = await db.query.customers.findFirst({
			where: and(
				eq(customers.document, cleanedDocument),
				eq(customers.tenantId, tenantId),
			),
			with: {
				financial: true,
				addresses: {
					where: eq(customerAddresses.isDefault, true),
				},
			},
		});

		if (!aCustomer) return null;

		return this.toDomain(aCustomer);
	}

	async findByEmail(email: string, tenantId: string): Promise<Customer | null> {
		const aCustomer = await db.query.customers.findFirst({
			where: and(
				eq(customers.email, email.toLowerCase()),
				eq(customers.tenantId, tenantId),
			),
			with: {
				financial: true,
				addresses: {
					where: eq(customerAddresses.isDefault, true),
				},
			},
		});

		if (!aCustomer) return null;

		return this.toDomain(aCustomer);
	}
	async findAll(
		tenantId: string,
		filters?: CustomerFilters,
	): Promise<Customer[]> {
		const conditions = [eq(customers.tenantId, tenantId)];

		if (filters?.isActive !== undefined) {
			conditions.push(eq(customers.isActive, filters.isActive));
		}

		if (filters?.type) {
			conditions.push(eq(customers.type, filters.type));
		}

		if (filters?.search) {
			const searchTerm = `%${filters.search}`;

			conditions.push(
				or(
					like(customers.name, searchTerm),
					like(customers.email, searchTerm),
					like(customers.document, searchTerm),
				)!,
			);
		}

		const theCustomers = await db.query.customers.findMany({
			where: and(...conditions),
			with: {
				financial: true,
				addresses: {
					where: eq(customerAddresses.isDefault, true),
				},
			},
			orderBy: [desc(customers.createdAt)],
			limit: filters?.limit || 100,
			offset: filters?.offset || 0,
		});

		return theCustomers.map((tc) => this.toDomain(tc));
	}

	async findWithDebt(tenantId: string): Promise<Customer[]> {
		const theCustomers = await db.query.customers.findMany({
			where: eq(customers.tenantId, tenantId),
			with: {
				financial: true,
				addresses: {
					where: eq(customerAddresses.isDefault, true),
				},
			},
			orderBy: [desc(customers.createdAt)],
		});

		return theCustomers
			.filter((tc) => tc.financial && Number(tc.financial.currentDebt) > 0)
			.map((tc) => this.toDomain(tc));
	}

	async delete(id: string, tenantId: string): Promise<void> {
		await db
			.delete(customers)
			.where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)));
	}

	private toDomain(row: any): Customer {
		const address = row.address?.[0]
			? Address.create({
					street: row.addresses[0].street,
					number: row.addresses[0].number,
					complement: row.addresses[0].complement || undefined,
					neighborhood: row.addresses[0].neighborhood,
					city: row.addresses[0].city,
					state: row.addresses[0].state,
					zipCode: row.addresses[0].zipCode,
					country: row.addresses[0].country,
				})
			: undefined;

		return Customer.restore({
			id: row.id,
			name: row.name,
			email: Email.create(row.email),
			phone: Phone.create(row.phone),
			document: Document.create(row.document),
			type: row.type,
			address,
			secondaryPhone: row.secondaryPhone
				? Phone.create(row.secondaryPhone)
				: undefined,
			notes: row.notes || undefined,
			isActive: row.isActive,
			creditLimit: row.financial?.creditLimit
				? Number(row.financial.creditLimit)
				: undefined,
			currentDebt: row.financial?.currentDebt
				? Number(row.financial.currentDebt)
				: 0,
			tenantId: row.tenantId,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		});
	}
}
