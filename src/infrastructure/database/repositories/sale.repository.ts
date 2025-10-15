import { and, between, desc, eq, gte, lte, sum } from "drizzle-orm";
import { Sale, type SaleStatus } from "../../../domain/entities/sale.entity";
import type {
	SaleFilters,
	SaleRepository,
} from "../../../domain/repositories/sale.repository";
import { db } from "../drizzle/client";
import { payments, saleItems, sales } from "../drizzle/schema";
import { SaleItem } from "../../../domain/value_objects/sale_item.vo";
import { Quantity } from "../../../domain/value_objects/quantity.vo";
import { Money } from "../../../domain/value_objects/money.vo";
import { Discount } from "../../../domain/value_objects/discount.vo";
import {
	Payment,
	type PaymentMethod,
	type PaymentStatus,
} from "../../../domain/entities/payment.entity";

export class DrizzleSaleRepository implements SaleRepository {
	async save(sale: Sale): Promise<void> {
		const existingSale = await db.query.sales.findFirst({
			where: and(eq(sales.id, sale.id), eq(sales.tenantId, sale.tenantId)),
		});

		const saleData = {
			id: sale.id,
			customerId: sale.customerId,
			customerName: sale.customerName,
			status: sale.status,
			discountType: sale.discount?.getType(),
			discountValue: sale.discount?.getValue().toString(),
			subtotal: sale.subtotal.toString(),
			discountAmount: sale.discountAmount?.toString(),
			total: sale.total.toString(),
			notes: sale.notes,
			userId: sale.userId,
			tenantId: sale.tenantId,
			updatedAt: new Date(),
			confirmedAt: sale.confirmedAt,
			paidAt: sale.paidAt,
			cancelledAt: sale.cancelledAt,
			cancellationReason: sale.cancellationReason,
		};

		if (existingSale) {
			await db
				.update(sales)
				.set(saleData)
				.where(and(eq(sales.id, sale.id), eq(sales.tenantId, sale.tenantId)));

			await db.delete(sales).where(eq(saleItems.saleId, sale.id));
			await db.delete(sales).where(eq(payments.saleId, sale.id));
		}

		await db.insert(sales).values({
			...saleData,
			createdAt: sale.createdAt,
		});

		if (sale.items.length > 0) {
			await this.saveSaleItems(sale.id, sale.items);
		}

		if (sale.payments.length > 0) {
			await this.savePayments(sale.id, sale.payments);
		}
	}

	private async saveSaleItems(
		saleId: string,
		items: SaleItem[],
	): Promise<void> {
		const itemsData = items.map((i) => ({
			id: i.id,
			saleId,
			productId: i.productId,
			productName: i.productName,
			productSku: i.productSku,
			quantity: i.quantity,
			unitPrice: i.unitPrice.toString(),
			discountType: i.discount?.getType(),
			discountValue: i.discount?.getValue().toString(),
			subtotal: i.subtotal.toString(),
			total: i.total.toString(),
		}));

		await db.insert(saleItems).values(itemsData);
	}

	private async savePayments(
		saleId: string,
		paymentList: Payment[],
	): Promise<void> {
		const paymentData = paymentList.map((pl) => ({
			id: pl.id,
			saleId,
			method: pl.method,
			amount: pl.amount.toString(),
			status: pl.status,
			paidAt: pl.paidAt,
			transactionId: pl.transactionId,
			notes: pl.notes,
			createdAt: pl.createdAt,
		}));

		await db.insert(payments).values(paymentData);
	}

	async findById(id: string, tenantId: string): Promise<Sale | null> {
		const aSale = await db.query.sales.findMany({
			where: and(eq(sales.id, id), eq(sales.tenantId, tenantId)),
			with: {
				items: true,
				payments: true,
			},
		});

		if (!aSale) return null;

		return this.toDomain(aSale);
	}

	async findByCustomer(customerId: string, tenantId: string): Promise<Sale[]> {
		const aSale = await db.query.sales.findMany({
			where: and(
				eq(sales.customerId, customerId),
				eq(sales.tenantId, tenantId),
			),
			with: {
				items: true,
				payments: true,
			},
			orderBy: [desc(sales.createdAt)],
		});

		return aSale.map((s) => this.toDomain(s));
	}

	async findAll(tenantId: string, filters?: SaleFilters): Promise<Sale[]> {
		const conditions = [eq(sales.tenantId, tenantId)];

		if (filters?.status) {
			conditions.push(eq(sales.status, filters.status));
		}

		if (filters?.customerId) {
			conditions.push(eq(sales.customerId, filters.customerId));
		}

		if (filters?.userId) {
			conditions.push(eq(sales.userId, filters.userId));
		}

		if (filters?.startDate && filters.endDate) {
			conditions.push(
				between(sales.createdAt, filters.startDate, filters.endDate),
			);
		}
		if (filters?.startDate) {
			conditions.push(gte(sales.createdAt, filters.startDate));
		}

		if (filters?.endDate) {
			conditions.push(lte(sales.createdAt, filters.endDate));
		}
		if (filters?.minAmount) {
			conditions.push(gte(sales.total, filters.minAmount.toString()));
		}
		if (filters?.maxAmount) {
			conditions.push(lte(sales.total, filters.maxAmount.toString()));
		}

		const theSales = await db.query.sales.findMany({
			where: and(...conditions),
			with: {
				items: true,
				payments: true,
			},
			orderBy: [desc(sales.createdAt)],
			limit: filters?.limit || 100,
			offset: filters?.offset || 0,
		});

		return theSales.map((s) => this.toDomain(s));
	}

	async getTotalSalesByCustomer(
		customerId: string,
		tenantId: string,
	): Promise<number> {
		const result = await db
			.select({ total: sum(sales.total) })
			.from(sales)
			.where(
				and(
					eq(sales.customerId, customerId),
					eq(sales.tenantId, tenantId),
					eq(sales.status, "PAID"),
				),
			);

		return Number(result[0]?.total || 0);
	}

	async getTotalSaleByPeriod(
		startDate: Date,
		endDate: Date,
		tenantId: string,
	): Promise<number> {
		const result = await db
			.select({ total: sum(sales.total) })
			.from(sales)
			.where(
				and(
					eq(sales.tenantId, tenantId),
					eq(sales.status, "PAID"),
					between(sales.createdAt, startDate, endDate),
				),
			);

		return Number(result[0]?.total || 0);
	}

	async delete(id: string, tenantId: string): Promise<void> {
		await db
			.delete(sales)
			.where(and(eq(sales.id, id), eq(sales.tenantId, tenantId)));
	}

	private toDomain(aSale: any): Sale {
		const items = aSale.items.map((item: any) =>
			SaleItem.restore({
				id: item.id,
				productId: item.productId,
				productName: item.productName,
				productSku: item.productSku,
				quantity: Quantity.create(item.quantity),
				unitPrice: Money.create(Number(item.unitPrice)),
				discount:
					item.discountType && item.discountValue
						? item.discountType === "PERCENTAGE"
							? Discount.createPercentage(Number(item.discountValue))
							: Discount.createFixed(Number(item.discountValue))
						: undefined,
				subtotal: Money.create(Number(item.subtotal)),
				total: Money.create(Number(item.total)),
			}),
		);

		const paymentsList = aSale.payments.map((payment: any) =>
			Payment.restore({
				id: payment.id,
				method: payment.method as PaymentMethod,
				amount: Money.create(Number(payment.amount)),
				status: payment.status as PaymentStatus,
				paidAt: payment.paidAt || undefined,
				transactionId: payment.transactionId || undefined,
				notes: payment.notes || undefined,
				createdAt: payment.createdAt,
			}),
		);
		const discount =
			aSale.discountType && aSale.discountValue
				? aSale.discountType === "PERCENTAGE"
					? Discount.createPercentage(Number(aSale.discountValue))
					: Discount.createFixed(Number(aSale.discountValue))
				: undefined;

		return Sale.restore({
			id: aSale.id,
			customerId: aSale.customerId,
			customerName: aSale.customerName,
			items,
			discount,
			status: aSale.status as SaleStatus,
			payments: paymentsList,
			subtotal: Money.create(Number(aSale.subtotal)),
			discountAmount: Money.create(Number(aSale.discountAmount)),
			total: Money.create(Number(aSale.total)),
			notes: aSale.notes || undefined,
			userId: aSale.userId,
			tenantId: aSale.tenantId,
			createdAt: aSale.createdAt,
			updatedAt: aSale.updatedAt,
			confirmedAt: aSale.confirmedAt || undefined,
			paidAt: aSale.paidAt || undefined,
			cancelledAt: aSale.cancelledAt || undefined,
			cancellationReason: aSale.cancellationReason || undefined,
		});
	}
}
