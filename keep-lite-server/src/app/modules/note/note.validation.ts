import { z } from "zod";

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const createNoteSchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .trim()
    .min(1, "Title cannot be empty")
    .max(200, "Title must be at most 200 characters"),
  content: z
    .string({ error: "Content is required" })
    .min(1, "Content cannot be empty"),
  color: z
    .string()
    .regex(HEX_COLOR_REGEX, "Color must be a valid hex color code (e.g. #ffffff)")
    .optional(),
  isPinned: z.boolean().optional(),
  categoryId: z.number().int().positive().nullable().optional(),
});

export const updateNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title cannot be empty")
    .max(200, "Title must be at most 200 characters")
    .optional(),
  content: z.string().min(1, "Content cannot be empty").optional(),
  color: z
    .string()
    .regex(HEX_COLOR_REGEX, "Color must be a valid hex color code (e.g. #ffffff)")
    .optional(),
  isPinned: z.boolean().optional(),
  categoryId: z.number().int().positive().nullable().optional(),
});

export type TCreateNote = z.infer<typeof createNoteSchema>;
export type TUpdateNote = z.infer<typeof updateNoteSchema>;
