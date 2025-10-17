import {
	BussinessRuleError,
	DatabaseError,
	NotFoundError,
	ValidationError,
} from "../../../shared/errors/application.errors";

export const errorHandle = (error: any) => {
	console.error("Error: ", error);

	if (error instanceof ValidationError) {
		return {
			status: 400,
			body: {
				error: "Validation Error",
				message: error.message,
				code: error.code,
			},
		};
	}

	if (error instanceof NotFoundError) {
		return {
			status: 404,
			body: {
				error: "Not Found",
				message: error.message,
				code: error.code,
			},
		};
	}

	if (error instanceof BussinessRuleError) {
		return {
			status: 422,
			body: {
				error: "Business Rule Error",
				message: error.message,
				code: error.code,
			},
		};
	}

	if (error instanceof DatabaseError) {
		return {
			status: 500,
			body: {
				error: "Database Error",
				message: error.message,
				code: error.code,
			},
		};
	}

	if (error.code === "22P02") {
		return {
			status: 400,
			body: {
				error: "Invalid UUID",
				message: "The provider ID is not a valid UUID format",
				code: "INVALID_UUID",
			},
		};
	}

	if (error.name === "DrizzleQueryError") {
		return {
			status: 500,
			body: {
				error: "Database Query Erro",
				message: "Failed to execute database query",
			},
		};
	}

	return {
		status: 500,
		body: {
			error: "Internal Server Error",
			message: "An unexpected error occurred",
		},
	};
};
