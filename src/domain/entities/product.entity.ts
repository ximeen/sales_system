import {
	ProductActivatedEvent,
	ProductCreatedEvent,
	ProductDeactivatedEvent,
	ProductPriceChangeEvent,
	type DomainEvent,
} from "../events/product.event";
import { Money } from "../value_objects/money.vo";
import { ProductName } from "../value_objects/product_name.vo";
import { SKU } from "../value_objects/sku.vo";

export interface ProductProps {
	id: string;
	name: ProductName;
	description?: string;
	sku: SKU;
	price: Money;
	costPrice?: Money;
	isActive: boolean;
	categoryId?: string;
	tenantId: string;
	createdAt: Date;
	updatedAt: Date;
}

export class Product {
	private props: ProductProps;
	private domainEvents: DomainEvent[] = [];

	private constructor(props: ProductProps) {
		this.props = props;
	}

	static create(
		id: string,
		name: string,
		sku: string,
		price: number,
		tenantId: string,
		description?: string,
		costPrice?: number,
		categoryId?: string,
	) {
		const productName = ProductName.create(name);
		const productSku = SKU.create(sku);
		const productPrice = Money.create(price);

		const now = new Date();

		const aProduct = new Product({
			id,
			name: productName,
			description,
			sku: productSku,
			price: productPrice,
			costPrice: costPrice ? Money.create(costPrice) : undefined,
			isActive: true,
			categoryId,
			tenantId,
			createdAt: now,
			updatedAt: now,
		});

		aProduct.addDomainEvent(new ProductCreatedEvent(id, name, sku, price));

		return aProduct;
	}

	static restore(props: ProductProps) {
		return new Product(props);
	}

	get id(): string {
		return this.props.id;
	}

	get name(): string {
		return this.props.name.getValue();
	}

	get description(): string | undefined {
		return this.props.description;
	}

	get sku(): string {
		return this.props.sku.getValue();
	}

	get price(): number {
		return this.props.price.getAmount();
	}

	get costPrice(): number | undefined {
		return this.props.costPrice?.getAmount();
	}

	get isActive(): boolean {
		return this.props.isActive;
	}

	get categoryId(): string | undefined {
		return this.props.categoryId;
	}

	get tenantId(): string {
		return this.props.tenantId;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get updatedAt(): Date {
		return this.props.updatedAt;
	}

	changePrice(newPrice: number): void {
		if (!this.props.isActive) {
			throw new Error(
				"It is not possible to change the price of an inactive product.",
			);
		}

		const oldPrice = this.props.price.getAmount();
		this.props.price = Money.create(newPrice);
		this.props.updatedAt = new Date();

		this.addDomainEvent(
			new ProductPriceChangeEvent(this.id, oldPrice, newPrice),
		);
	}

	updateInfo(name?: string, description?: string, categoryId?: string): void {
		if (name) {
			this.props.name = ProductName.create(name);
		}
		if (description !== undefined) {
			this.props.description = description;
		}
		if (categoryId !== undefined) {
			this.props.categoryId = categoryId;
		}
		this.props.updatedAt = new Date();
	}

	activate(): void {
		if (this.props.isActive) {
			throw new Error("Product already active");
		}
		this.props.isActive = true;
		this.props.updatedAt = new Date();
		this.addDomainEvent(new ProductActivatedEvent(this.id));
	}

	deactivate(): void {
		if (!this.props.isActive) {
			throw new Error("Product already deactivated");
		}

		this.props.isActive = false;
		this.props.updatedAt = new Date();
		this.addDomainEvent(new ProductDeactivatedEvent(this.id));
	}

	calculateProfitMargin(): number | null {
		if (!this.props.costPrice) {
			return null;
		}

		const profit =
			this.props.price.getAmount() - this.props.costPrice.getAmount();
		return (profit / this.props.price.getAmount()) * 100;
	}

	private addDomainEvent(event: DomainEvent): void {
		this.domainEvents.push(event);
	}

	getDomainEvents(): DomainEvent[] {
		return [...this.domainEvents];
	}

	clearDomainEvents(): void {
		this.domainEvents = [];
	}
}
