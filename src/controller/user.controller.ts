import { Request, Response } from "express";
import { UserService } from "../service/user.service.js";

export class UserController {
  constructor(private service: UserService) {}

  getAll = async (_req: Request, res: Response) => {
    const users = await this.service.getUsers();
    res.json(users);
  };

  getById = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const user = await this.service.getUserById(id);
      res.json(user);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const user = await this.service.createUser(req.body);
      res.status(201).json(user);
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const updated = await this.service.updateUser(id, req.body);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  };

  remove = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      await this.service.deleteUser(id);
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  };
} 
