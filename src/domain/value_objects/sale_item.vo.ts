import type { Discount } from "./discount.vo";
import { Money } from "./money.vo";
import { Quantity } from "./quantity.vo";

export interface SaleItemProps {
	id: string;
	productId: string;
	productName: string;
	productSku: string;
	quantity: Quantity;
	unitPrice: Money;
	discount?: Discount;
	subtotal: Money;
	total: Money;
}

export class SaleItem {
	private props: SaleItemProps;

	private constructor(props: SaleItemProps) {
		this.props = props;
	}

	static create(
		id: string,
		productId: string,
		productName: string,
		productSku: string,
		quantity: number,
		unitPrice: number,
		discount?: Discount,
	): SaleItem {
		const qty = Quantity.create(quantity);
		const price = Money.create(unitPrice);

		const subtotal = price.multiply(quantity);

		let total = subtotal;

		if (discount) {
			const discountAmount = discount.calculate(subtotal.getAmount());
			total = Money.create(subtotal.getAmount() - discountAmount);
		}

		return new SaleItem({
			id,
			productId,
			productSku,
			productName,
			quantity: qty,
			unitPrice: price,
			discount,
			subtotal,
			total,
		});
	}

	static restore(props: SaleItemProps): SaleItem {
		return new SaleItem(props);
	}

	get id(): string {
		return this.props.id;
	}

	get productId(): string {
		return this.props.productId;
	}

	get productName(): string {
		return this.props.productName;
	}

	get productSku(): string {
		return this.props.productSku;
	}

	get quantity(): number {
		return this.props.quantity.getValue();
	}

	get unitPrice(): number {
		return this.props.unitPrice.getAmount();
	}

	get discount(): Discount | undefined {
		return this.props.discount;
	}

	get subtotal(): number {
		return this.props.subtotal.getAmount();
	}

	get total(): number {
		return this.props.total.getAmount();
	}

	get discountAmount(): number {
		if (!this.props.discount) return 0;
		return this.props.discount.calculate(this.props.subtotal.getAmount());
	}

	changeQuantity(newQuantity: number): SaleItem {
		return SaleItem.create(
			this.id,
			this.productId,
			this.productName,
			this.productSku,
			newQuantity,
			this.unitPrice,
			this.discount,
		);
	}

	applyDiscount(discount: Discount): SaleItem {
		return SaleItem.create(
			this.id,
			this.productId,
			this.productSku,
			this.productName,
			this.quantity,
			this.unitPrice,
			discount,
		);
	}

	removeDiscount(): SaleItem {
		return SaleItem.create(
			this.id,
			this.productId,
			this.productSku,
			this.productName,
			this.quantity,
			this.unitPrice,
		);
	}
}
