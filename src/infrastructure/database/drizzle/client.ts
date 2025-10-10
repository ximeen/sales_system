import postgres from "postgres";
import { env } from "../../config/env";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = `postgres://${env.database.user}:${env.database.password}@${env.database.host}:${env.database.port}/${env.database.database}`;

export const queryClient = postgres(connectionString);

export const db = drizzle(queryClient, { schema });
export const closeDatabase = async () => {
	await queryClient.end();
};
