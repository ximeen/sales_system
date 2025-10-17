import swagger from "@elysiajs/swagger";
import Elysia from "elysia";
import { env } from "./infrastructure/config/env";
import { productController } from "./presentation/http/controllers/product.controller";
import { errorHandle } from "./presentation/http/middlewares/error_handle";

const server = new Elysia()
	.use(
		swagger({
			documentation: {
				info: {
					title: "Sales system API",
					version: "1.0.0",
					description: "Professional Sales management System",
				},
				tags: [
					{ name: "Products", description: "Product management endpoints" },
					{ name: "Customers", description: "Customers management endpoints" },
					{ name: "Sales", description: "Sales management endpoints" },
					{ name: "Stock", description: "Stock management endpoints" },
				],
			},
		}),
	)
	.onError(({ error, set }) => {
		const response = errorHandle(error);
		set.status = response.status;
		return response.body;
	})
	.get("/", () => ({
		message: "Sales System API running 🚀",
		version: "1.0.0",
		docs: "/swagger",
	}))
	.use(productController)
	.listen(env.server.port);

console.log(`🚀 Server is running on http://localhost:${env.server.port}`);
console.log(`📚 Swagger docs: http://localhost:${env.server.port}/swagger`);

export type Server = typeof server;
