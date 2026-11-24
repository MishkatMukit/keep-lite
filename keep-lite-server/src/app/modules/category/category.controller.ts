import type { Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../../utils/appError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { categoryService } from "./category.service";
import type { TCreateCategory, TUpdateCategory } from "./category.validation";

const getAuthenticatedUserId = (req: Request): number => {
  const userId = req.user?.userId;
  if (typeof userId !== "number") {
    throw new AppError(
      "Unauthorized. Please log in to access this resource.",
      httpStatus.UNAUTHORIZED,
    );
  }
  return userId;
};

const parseCategoryId = (paramId: unknown): number => {
  const raw = Array.isArray(paramId) ? paramId[0] : paramId;
  const id = typeof raw === "string" ? Number(raw) : Number.NaN;
  if (
    typeof raw !== "string" ||
    !raw.trim() ||
    Number.isNaN(id) ||
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new AppError("Invalid category ID", httpStatus.BAD_REQUEST);
  }
  return id;
};

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const payload = req.body as TCreateCategory;

  const result = await categoryService.createCategory(userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);

  const result = await categoryService.getAllCategories(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Categories retrieved successfully",
    data: result,
  });
});

const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const categoryId = parseCategoryId(req.params.id);

  const result = await categoryService.getCategoryById(categoryId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category retrieved successfully",
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const categoryId = parseCategoryId(req.params.id);
  const payload = req.body as TUpdateCategory;

  const result = await categoryService.updateCategory(
    categoryId,
    userId,
    payload,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const categoryId = parseCategoryId(req.params.id);

  await categoryService.deleteCategory(categoryId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category deleted successfully",
    data: null,
  });
});

export const categoryController = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
