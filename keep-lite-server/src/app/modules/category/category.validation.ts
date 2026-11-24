import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string({ error: "Category name is required" })
    .trim()
    .min(1, "Category name cannot be empty")
    .max(50, "Category name must be at most 50 characters"),
});

export const updateCategorySchema = z.object({
  name: z
    .string({ error: "Category name is required" })
    .trim()
    .min(1, "Category name cannot be empty")
    .max(50, "Category name must be at most 50 characters"),
});

export type TCreateCategory = z.infer<typeof createCategorySchema>;
export type TUpdateCategory = z.infer<typeof updateCategorySchema>;
