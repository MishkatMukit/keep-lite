import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import validateRequest from "../../middleware/validateRequest";
import { categoryController } from "./category.controller";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation";

const router = Router();

router.use(auth());

router.post(
  "/",
  validateRequest(createCategorySchema),
  categoryController.createCategory,
);
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.patch(
  "/:id",
  validateRequest(updateCategorySchema),
  categoryController.updateCategory,
);
router.delete("/:id", categoryController.deleteCategory);

export const CategoryRoutes = router;
