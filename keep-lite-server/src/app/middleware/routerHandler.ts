import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

export const routeHandler = (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    statusCode: httpStatus.NOT_FOUND,
    message: `Route '${req.originalUrl}' not found`,
    data: null,
  });
};
