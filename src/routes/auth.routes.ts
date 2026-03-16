// Authentication routes (login and register)

import { Router } from "express";
import { UserRepository } from "../repository/user.repository.js";
import { LoginController } from "../controller/login.controller.js";

const loginController = new LoginController(new UserRepository());
const loginRouter = Router();

// Register endpoint - creates new user and returns tokens
loginRouter.post("/register", loginController.register);

// Login endpoint - creates tokens
loginRouter.post("/login", loginController.login);



export default loginRouter;
