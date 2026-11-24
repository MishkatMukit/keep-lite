import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import validateRequest from "../../middleware/validateRequest";
import { noteController } from "./note.controller";
import { createNoteSchema, updateNoteSchema } from "./note.validation";

const router = Router();

router.use(auth());

router.post(
  "/",
  validateRequest(createNoteSchema),
  noteController.createNote,
);
router.get("/", noteController.getAllNotes);
router.get("/:id", noteController.getNoteById);
router.patch(
  "/:id",
  validateRequest(updateNoteSchema),
  noteController.updateNote,
);
router.delete("/:id", noteController.deleteNote);

export const NoteRoutes = router;
