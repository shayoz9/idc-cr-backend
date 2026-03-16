import { Router } from "express";
import { UserController } from "../controller/user.controller.js";
import { UserService } from "../service/user.service.js";
import { UserRepository } from "../repository/user.repository.js";
import { isAdmin, authorize } from "../middleware/authorize.middleware.js";

const userRouter = Router();

// Manual dependency injection
const repo = new UserRepository();
const service = new UserService(repo);
const controller = new UserController(service);

// Public routes
userRouter.get("/:id", controller.getById);
userRouter.get("/", controller.getAll);

// Admin only routes
userRouter.post("/", isAdmin, controller.create);
userRouter.put("/:id", isAdmin, controller.update);
userRouter.delete("/:id", isAdmin, controller.remove);

// Optional: Routes accessible by admin and moderator
// userRouter.get("/", authorize("admin", "moderator"), controller.getAll);

export default userRouter;
