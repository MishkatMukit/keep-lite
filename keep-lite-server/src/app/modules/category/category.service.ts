import httpStatus from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import type { ICreateCategory, IUpdateCategory } from "./category.interface";

const createCategory = async (userId: number, payload: ICreateCategory) => {
  const name = payload.name.trim();

  try {
    const category = await prisma.category.create({
      data: {
        name,
        userId,
      },
    });

    return category;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(
        "Category with this name already exists",
        httpStatus.CONFLICT,
      );
    }
    throw error;
  }
};

const getAllCategories = async (userId: number) => {
  return prisma.category.findMany({
    where: { userId },
    include: {
      _count: {
        select: { notes: true },
      },
    },
    orderBy: { name: "asc" },
  });
};

const getCategoryById = async (id: number, userId: number) => {
  const category = await prisma.category.findFirst({
    where: { id, userId },
    include: {
      _count: {
        select: { notes: true },
      },
    },
  });

  if (!category) {
    throw new AppError("Category not found", httpStatus.NOT_FOUND);
  }

  return category;
};

const updateCategory = async (
  id: number,
  userId: number,
  payload: IUpdateCategory,
) => {
  const existingCategory = await prisma.category.findFirst({
    where: { id, userId },
  });

  if (!existingCategory) {
    throw new AppError("Category not found", httpStatus.NOT_FOUND);
  }

  const name = payload.name.trim();

  try {
    const updated = await prisma.category.update({
      where: { id },
      data: { name },
    });

    return updated;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(
        "Category with this name already exists",
        httpStatus.CONFLICT,
      );
    }
    throw error;
  }
};

const deleteCategory = async (id: number, userId: number) => {
  const existingCategory = await prisma.category.findFirst({
    where: { id, userId },
  });

  if (!existingCategory) {
    throw new AppError("Category not found", httpStatus.NOT_FOUND);
  }

  return prisma.category.delete({
    where: { id },
  });
};

export const categoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
