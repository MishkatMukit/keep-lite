import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import type {
  ICreateNote,
  INoteFilterQuery,
  IUpdateNote,
} from "./note.interface";

const createNote = async (userId: number, payload: ICreateNote) => {
  if (payload.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: payload.categoryId, userId },
    });

    if (!category) {
      throw new AppError("Category not found", httpStatus.NOT_FOUND);
    }
  }

  const createData: {
    title: string;
    content: string;
    color?: string;
    isPinned?: boolean;
    userId: number;
    categoryId?: number | null;
  } = {
    title: payload.title.trim(),
    content: payload.content,
    userId,
  };

  if (payload.color !== undefined) {
    createData.color = payload.color;
  }
  if (payload.isPinned !== undefined) {
    createData.isPinned = payload.isPinned;
  }
  if (payload.categoryId !== undefined) {
    createData.categoryId = payload.categoryId;
  }

  return prisma.note.create({
    data: createData,
    include: {
      category: true,
    },
  });
};

const getAllNotes = async (userId: number, query: INoteFilterQuery) => {
  const whereConditions: {
    userId: number;
    categoryId?: number;
    OR?: Array<
      | { title: { contains: string; mode: "insensitive" } }
      | { content: { contains: string; mode: "insensitive" } }
    >;
  } = { userId };

  if (query.search?.trim()) {
    const term = query.search.trim();
    whereConditions.OR = [
      { title: { contains: term, mode: "insensitive" } },
      { content: { contains: term, mode: "insensitive" } },
    ];
  }

  if (query.categoryId) {
    whereConditions.categoryId = query.categoryId;
  }

  return prisma.note.findMany({
    where: whereConditions,
    include: {
      category: true,
    },
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
  });
};

const getNoteById = async (id: number, userId: number) => {
  const note = await prisma.note.findFirst({
    where: { id, userId },
    include: {
      category: true,
    },
  });

  if (!note) {
    throw new AppError("Note not found", httpStatus.NOT_FOUND);
  }

  return note;
};

const updateNote = async (
  id: number,
  userId: number,
  payload: IUpdateNote,
) => {
  await getNoteById(id, userId);

  if (payload.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: payload.categoryId, userId },
    });

    if (!category) {
      throw new AppError("Category not found", httpStatus.NOT_FOUND);
    }
  }

  const updateData: {
    title?: string;
    content?: string;
    color?: string;
    isPinned?: boolean;
    categoryId?: number | null;
  } = {};

  if (payload.title !== undefined) {
    updateData.title = payload.title.trim();
  }
  if (payload.content !== undefined) {
    updateData.content = payload.content;
  }
  if (payload.color !== undefined) {
    updateData.color = payload.color;
  }
  if (payload.isPinned !== undefined) {
    updateData.isPinned = payload.isPinned;
  }
  if (payload.categoryId !== undefined) {
    updateData.categoryId = payload.categoryId;
  }

  return prisma.note.update({
    where: { id },
    data: updateData,
    include: {
      category: true,
    },
  });
};

const deleteNote = async (id: number, userId: number) => {
  await getNoteById(id, userId);

  return prisma.note.delete({
    where: { id },
  });
};

export const noteServices = {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
};
