import { CreateCustomerUseCase } from "../../application/use_cases/customer/create_customer.usecase";
import { CreateProductUseCase } from "../../application/use_cases/product/create_product.usecase";
import { GetProductsByIdUseCase } from "../../application/use_cases/product/get_products_by_id.usecase";
import { AddSaleItemUseCase } from "../../application/use_cases/sale/add_sale_item.usecase";
import { CreateSaleUseCase } from "../../application/use_cases/sale/create_sale.usecase";
import { AddStockUseCase } from "../../application/use_cases/stock/add_stock.usecase";
import { DrizzleCustomerRepository } from "../database/repositories/customer.repository";
import { DrizzleProductRepository } from "../database/repositories/product.repository";
import { DrizzleSaleRepository } from "../database/repositories/sale.repository";
import { DrizzleStockRepository } from "../database/repositories/stock.repository";

export class Container {
	private static productRepository = new DrizzleProductRepository();
	private static customerRepository = new DrizzleCustomerRepository();
	private static stockRepository = new DrizzleStockRepository();
	private static saleRepository = new DrizzleSaleRepository();

	static getProductRepository() {
		return Container.productRepository;
	}

	static getCustomerRepository() {
		return Container.customerRepository;
	}

	static getStockRepository() {
		return Container.stockRepository;
	}

	static getSaleRepository() {
		return Container.saleRepository;
	}

	static getProductByIdUseCase() {
		return new GetProductsByIdUseCase(Container.productRepository);
	}

	static getCreateProductUseCase() {
		return new CreateProductUseCase(Container.productRepository);
	}

	static getCreateCustomerUseCase() {
		return new CreateCustomerUseCase(Container.customerRepository);
	}

	static getAddStockUseCase() {
		return new AddStockUseCase(
			Container.stockRepository,
			Container.productRepository,
		);
	}

	static getCreateSaleUseCase() {
		return new CreateSaleUseCase(
			Container.saleRepository,
			Container.customerRepository,
		);
	}

	static getAddSaleItemUseCase() {
		return new AddSaleItemUseCase(
			Container.saleRepository,
			Container.productRepository,
			Container.stockRepository,
		);
	}
}
