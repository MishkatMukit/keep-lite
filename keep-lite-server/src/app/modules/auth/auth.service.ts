import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import type { JwtPayload } from "jsonwebtoken";
import { ActiveStatus } from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { createAuthTokens } from "../../utils/authToken";
import { AppError } from "../../utils/appError";
import { jwtUtils } from "../../utils/jwt";
import type {
  ILoginUser,
  IRegisterUser,
  IRequestUser,
} from "./auth.interface";

const registerUser = async (payload: IRegisterUser) => {
  const { name, password } = payload;
  const email = payload.email.trim().toLowerCase();

  const isUserExists = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (isUserExists) {
    throw new AppError(
      "User with this email already exists",
      httpStatus.CONFLICT,
    );
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    omit: { password: true },
  });

  const { accessToken, refreshToken } = await createAuthTokens({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  return { user, accessToken, refreshToken };
};

const loginUser = async (payload: ILoginUser) => {
  const { password } = payload;
  const email = payload.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError("User Not Found", httpStatus.NOT_FOUND);
  }

  if (user.status === ActiveStatus.SUSPENDED) {
    throw new AppError("User is Suspended", httpStatus.FORBIDDEN);
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError("Invalid credentials", httpStatus.UNAUTHORIZED);
  }

  const { accessToken, refreshToken } = await createAuthTokens({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  return { accessToken, refreshToken };
};

const getMe = async (user: IRequestUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: { id: user.userId },
    omit: { password: true },
  });

  if (!isUserExists) {
    throw new AppError("User not found", httpStatus.NOT_FOUND);
  }

  return isUserExists;
};

const refreshToken = async (token: string) => {
  const verifiedRefreshToken = jwtUtils.verifyToken(
    token,
    config.jwt_refresh_secret,
  );

  if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
    throw new AppError(
      config.node_env === "development"
        ? verifiedRefreshToken.error
        : "Invalid refresh token",
      httpStatus.UNAUTHORIZED,
    );
  }

  const data = verifiedRefreshToken.data as JwtPayload;

  if (typeof data.userId !== "number") {
    throw new AppError("Invalid refresh token payload", httpStatus.UNAUTHORIZED);
  }

  const user = await prisma.user.findUnique({ where: { id: data.userId } });

  if (!user || user.status !== ActiveStatus.ACTIVE) {
    throw new AppError("User is inactive or not found", httpStatus.UNAUTHORIZED);
  }

  const tokens = await createAuthTokens({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  return tokens;
};

export const authService = {
  registerUser,
  loginUser,
  getMe,
  refreshToken,
};
