import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import httpStatus from "http-status";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { routeHandler } from "./app/middleware/routerHandler";
import { AuthRoutes } from "./app/modules/auth/auth.route";
import { CategoryRoutes } from "./app/modules/category/category.route";
import { NoteRoutes } from "./app/modules/note/note.route";
import sendResponse from "./app/utils/sendResponse";

const app: Application = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Root liveness check
app.get("/", (_req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Server is running",
    author: "4AM",
  });
});

// API v1 Health check
app.get("/api/v1/health", (_req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "KeepLite API is healthy",
    data: {
      status: "UP",
      timestamp: new Date().toISOString(),
      environment: config.node_env,
    },
  });
});

// Feature routes
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/categories", CategoryRoutes);
app.use("/api/v1/notes", NoteRoutes);

// 404 and Global Error handling
app.use(routeHandler);
app.use(globalErrorHandler);

export default app;
