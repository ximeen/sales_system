export const env = {
	database: {
		host: process.env.DB_HOST || "localhost",
		port: Number(process.env.DB_PORT) || 5432,
		user: process.env.DB_USER || "docker",
		password: process.env.DB_PASSWORD || "docker",
		database: process.env.DB_NAME || "sales_system",
	},
	server: {
		port: Number(process.env.SERVER_PORT) || 3333,
	},
	openAi: {
		apiKey: process.env.OPENAI_API_KEY || "",
	},
} as const;
