import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/infrastructure/database/drizzle/schema.ts",
	out: "./src/infrastructure/database/drizzle/migrations",
	dialect: "postgresql",
	dbCredentials: {
		host: process.env.DB_HOST || "localhost",
		port: Number(process.env.DB_PORT) || 5432,
		user: process.env.DB_USER || "docker",
		password: process.env.DB_PASSWORD || "docker",
		database: process.env.DB_NAME || "sales_system",
	},
	verbose: true,
	strict: true,
});
