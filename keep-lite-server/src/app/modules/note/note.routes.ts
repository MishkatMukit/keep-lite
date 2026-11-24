import { Router } from "express";
import { noteController } from "./note.controller";

const router = Router()

router.post('/',  noteController.postNote )

export const noteRoutes = router