import { User } from "../model/user.js";
import { UserRepository } from "../repository/user.repository.js";

export class UserService {

  constructor(private repo: UserRepository) {}

  async getUsers(): Promise<User[]> {
    return this.repo.findAll();
  }

  async getUserById(id: number): Promise<User | null> {
    const user = this.repo.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    return this.repo.create(user);
  }

  async updateUser(id: number, user: Omit<User, "id">): Promise<User> {
    const updated = await this.repo.update(id, user);
    if (!updated) {
      throw new Error("User not found");
    }
    return updated;
  }

  async deleteUser(id: number): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new Error("User not found");
    }
  }
} 
