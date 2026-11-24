import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client";
import config from "../config";
import {AppError} from "../utils/appError";

export const globalErrorHandler = async (
	err: any,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	if (config.node_env === "development") {
		console.log("Error from Global Error Handler", err);
	}

	let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
	let errorMessage = err.message || "Internal Server Error";
	const errorName = err.name || "Internal Server Error";

	if (err instanceof ZodError || err?.name === "ZodError") {
		statusCode = httpStatus.BAD_REQUEST;
		errorMessage =
			err.issues?.map((issue: any) => `${issue.path.join(".")}: ${issue.message}`).join(", ") ||
			"Validation Error";
	} else if (err instanceof Prisma.PrismaClientValidationError) {
		statusCode = httpStatus.BAD_REQUEST;
		errorMessage = "You have provided incorrect field type or missing fields";
	} else if (err instanceof Prisma.PrismaClientKnownRequestError) {
		if (err.code === "P2002") {
			statusCode = httpStatus.CONFLICT;
			const target = Array.isArray(err.meta?.target)
				? err.meta.target.join(", ")
				: typeof err.meta?.target === "string"
					? err.meta.target
					: "field";
			errorMessage = `Duplicate value error: a record with this ${target} already exists.`;
		} else if (err.code === "P2003") {
			statusCode = httpStatus.BAD_REQUEST;
			errorMessage = "Foreign key constraint failed";
		} else if (err.code === "P2025") {
			statusCode = httpStatus.NOT_FOUND;
			errorMessage =
				"The requested record was not found or could not be operated on.";
		}
	} else if (err instanceof Prisma.PrismaClientInitializationError) {
		if (err.errorCode === "P1000") {
			statusCode = httpStatus.UNAUTHORIZED;
			errorMessage =
				"Authentication failed against database server. Please Check Your Credentials";
		} else if (err.errorCode === "P1001") {
			statusCode = httpStatus.BAD_REQUEST;
			errorMessage = "Can't reach database server";
		}
	} else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
		statusCode = httpStatus.INTERNAL_SERVER_ERROR;
		errorMessage = "Error occurred during query execution";
	}else if(err instanceof AppError){
		errorMessage = err.message;
		statusCode = err.statusCode;
	}
	else if (err instanceof Error) {
		errorMessage = err.message;
	}

	const isDevelopment = config.node_env === "development";
	// 4xx messages are deliberate and safe to show; hide 5xx details outside development
	const exposeMessage = isDevelopment || statusCode < 500;

	res.status(statusCode).json({
		success: false,
		statusCode,
		name: exposeMessage ? errorName : "Internal Server Error",
		message: exposeMessage ? errorMessage : "Internal Server Error",
		error: isDevelopment ? err : undefined,
		stack: isDevelopment ? err.stack : undefined,
	});
};
