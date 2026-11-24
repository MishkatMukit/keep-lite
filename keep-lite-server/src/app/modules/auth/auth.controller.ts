import type { Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../config";
import { AppError } from "../../utils/appError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { authService } from "./auth.service";
import type { TLoginUser, TRegisterUser } from "./auth.validation";

const cookieOptions = {
  httpOnly: true,
  secure: config.node_env !== "development",
  sameSite: config.node_env === "development" ? "lax" : "none",
} as const;

const setAuthCookies = (
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
) => {
  res.cookie("accessToken", tokens.accessToken, {
    ...cookieOptions,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours / 1 day
  });
  res.cookie("refreshToken", tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as TRegisterUser;

  const result = await authService.registerUser(payload);
  setAuthCookies(res, result);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as TLoginUser;

  const result = await authService.loginUser(payload);
  setAuthCookies(res, result);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError(
      "User information is missing in the request",
      httpStatus.UNAUTHORIZED,
    );
  }

  const result = await authService.getMe(user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile fetched successfully",
    data: result,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  if (typeof token !== "string" || !token) {
    throw new AppError("Refresh token is missing", httpStatus.UNAUTHORIZED);
  }

  const result = await authService.refreshToken(token);
  setAuthCookies(res, result);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "New tokens generated successfully",
    data: result,
  });
});

// No auth guard: an expired session must still be able to clear its cookies.
const logout = catchAsync(async (_req: Request, res: Response) => {
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

export const authController = {
  logout,
  registerUser,
  loginUser,
  getMe,
  refreshToken,
};
