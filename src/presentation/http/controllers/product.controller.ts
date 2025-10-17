import Elysia, { t } from "elysia";
import { Container } from "../../../infrastructure/http/container";


export const productController = new Elysia({prefix: "/products"})
    .post("/", async ({body})=> {
        const result = Container.getCreateProductUseCase().execute(body)
        return result 
    }, {
        body: t.Object({
            name: t.String({minLength: 3, maxLength: 200}),
            description: t.Optional(t.String()),
            sku: t.String({minLength: 1, maxLength: 50}),
            price: t.Number({minimum: 0.01}),
            costPrice: t.Optional(t.Number({minimum: 0})),
            categoryId: t.Optional(t.String()),
            tenantId: t.String()
        }),
        detail: {
            tags: ["Products"],
            summary: "Create a new product",
            description: "Creates a new product in the system"
        }
    })
    .get("/:id", async ({params, query}) =>{
        
        const product = Container.getProductByIdUseCase().execute(params.id, query.tenantId)
    
        return product;
    },{
        params: t.Object({
            id: t.String()
        }),
        query: t.Object({
            tenantId: t.String()
        }),
        detail: {
            tags: ["Products"],
            summary: "Get products by ID",
            description: "Retrieves a product by its ID"
        }
    })