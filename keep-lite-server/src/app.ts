import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { routeHandler } from "./app/middleware/routerHandler";
import { AuthRoutes } from "./app/modules/auth/auth.route";
import { noteRoutes } from "./app/modules/note/note.routes";

const app: Application = express();
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", async (req: Request, res: Response) => {
  res.json({
    message: "Server is running",
    author : "4AM",
  });
});

app.use("/api/v1/auth", AuthRoutes);
// app.use("/note", noteRoutes);

app.use(routeHandler);
app.use(globalErrorHandler);

export default app;
