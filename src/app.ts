import express from "express";
import cors from "cors";
import loginRouter from "./routes/auth.routes.js";
import {
  refreshTokenHandler,
  verifyAccessToken,
} from "./middleware/jwt.middleware.js";
import { logger } from "./middleware/logger.middleware.js";
import userRoutes from "./routes/user.routes.js";
import taskRoutes from "./routes/task.routes.js";

export const app = express();
app.use(cors());
app.use(express.json());

// Login routes
app.use("/", loginRouter);

// Logging middleware
app.use(logger);

// Refresh token endpoint
app.post("/auth/refresh", refreshTokenHandler);

// Auth routes
app.use(verifyAccessToken);

// Application routes
app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);
