import { Request, Response } from "express";
import { createAccessToken, createRefreshToken } from "../middleware/jwt.middleware.js";
import { UserRepository } from "../repository/user.repository.js";

export class LoginController {

  constructor(private repo: UserRepository) {}
  
  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      const user = await this.repo.authenticate(email, password);
  
      const accessToken = createAccessToken(user);
      const refreshToken = createRefreshToken(user);
  
      res.json({
        message: "Login successful",
        user: {
          name: user.name,
          email: user.email
        },
        accessToken,
        refreshToken,
        expiresIn: "15m"
      });
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  };

  register = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password} = req.body;
    try {
      // Validate input
      if (!name || !email || !password) {
        res.status(400).json({ error: "Name, email, and password are required" });
        return;
      }

      // Check if user already exists
      const existingUser = await this.repo.findByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: "User with this email already exists" });
        return;
      }

      // Create the user with hashed password
      const newUser = await this.repo.create({ name, email, password, role: "user" });

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
}