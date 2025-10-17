export class ApplicationError extends Error {
	constructor(
		message: string,
		public readonly code?: string,
	) {
		super(message);
		this.name = "ApplicationError";
	}
}

export class NotFoundError extends ApplicationError {
	constructor(resource: string, id?: string) {
		super(
			id ? `${resource} with id ${id} not found` : `${resource} not found`,
			"NOT_FOUND",
		);
		this.name = "NotFoundError";
	}
}

export class ValidationError extends ApplicationError {
	constructor(message: string) {
		super(message, "VALIDATION_ERROR");
		this.name = "ValidationError";
	}
}

export class BussinessRuleError extends ApplicationError {
	constructor(message: string) {
		super(message, "BUSSINESS_RULE_ERROR");
		this.name = "BussinessRuleError";
	}
}

export class DatabaseError extends ApplicationError {
	constructor(
		message: string,
		public details?: any,
	) {
		super(message);
		this.name = "DatabaseError";
	}
}

