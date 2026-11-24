import type { Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../../utils/appError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import type { INoteFilterQuery } from "./note.interface";
import { noteServices } from "./note.service";
import type { TCreateNote, TUpdateNote } from "./note.validation";

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

const parseNoteId = (paramId: unknown): number => {
  const raw = Array.isArray(paramId) ? paramId[0] : paramId;
  const id = typeof raw === "string" ? Number(raw) : Number.NaN;
  if (
    typeof raw !== "string" ||
    !raw.trim() ||
    Number.isNaN(id) ||
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new AppError("Invalid note ID", httpStatus.BAD_REQUEST);
  }
  return id;
};

const createNote = catchAsync(async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const payload = req.body as TCreateNote;

  const result = await noteServices.createNote(userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Note created successfully.",
    data: result,
  });
});

const getAllNotes = catchAsync(async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);

  const query: INoteFilterQuery = {};

  if (typeof req.query.search === "string" && req.query.search.trim()) {
    query.search = req.query.search.trim();
  }

  if (typeof req.query.categoryId === "string") {
    const parsedCategoryId = Number(req.query.categoryId);
    if (!Number.isNaN(parsedCategoryId) && parsedCategoryId > 0) {
      query.categoryId = parsedCategoryId;
    }
  }

  const result = await noteServices.getAllNotes(userId, query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notes retrieved successfully.",
    data: result,
  });
});

const getNoteById = catchAsync(async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const noteId = parseNoteId(req.params.id);

  const result = await noteServices.getNoteById(noteId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Note retrieved successfully.",
    data: result,
  });
});

const updateNote = catchAsync(async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const noteId = parseNoteId(req.params.id);
  const payload = req.body as TUpdateNote;

  const result = await noteServices.updateNote(noteId, userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Note updated successfully.",
    data: result,
  });
});

const deleteNote = catchAsync(async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const noteId = parseNoteId(req.params.id);

  await noteServices.deleteNote(noteId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Note deleted successfully.",
    data: null,
  });
});

export const noteController = {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
};
