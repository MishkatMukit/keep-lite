import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import validateRequest from "../../middleware/validateRequest";
import { authController } from "./auth.controller";
import { loginUserSchema, registerUserSchema } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(registerUserSchema),
  authController.registerUser,
);
router.post(
  "/login",
  validateRequest(loginUserSchema),
  authController.loginUser,
);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.get(
  "/me",
  auth(Role.CUSTOMER, Role.ADMIN),
  authController.getMe,
);

export const AuthRoutes = router;
