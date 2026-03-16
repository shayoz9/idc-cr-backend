import { pool } from "../config/db.js";
import { User } from "../model/user.js";
import bcrypt from "bcryptjs";

export class UserRepository {
  
  async authenticate(email: any, password: any) {
    const res = await pool.query("SELECT id, name, email, password, role FROM users WHERE email = $1", [email]);
    const user: User | null = res.rows[0] ?? null;
    if (!user) {
      throw new Error("Invalid credentials");
    }
    
    // Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }
    // Return user without password and id
    const { id: _, password: __, ...userDTO } = user;
    return userDTO;
  }

  async findAll(): Promise<User[]> {
    const res = await pool.query(
      "SELECT id, name, email, role FROM users"
    );
    return res.rows;
  }

  async findById(id: number): Promise<User | null> {
    const res = await pool.query("SELECT id, name, email, role FROM users WHERE id = $1", [id]);
    return res.rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const res = await pool.query("SELECT id, name, email, role FROM users WHERE email = $1", [email]);
    return res.rows[0] ?? null;
  }

  async create(user: Omit<User, "id">): Promise<User> {
    // Hash the password
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    const role = user.role || "user";
    
    const res = await pool.query(
      "INSERT INTO users(name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [user.name, user.email, hashedPassword, role]
    );
    return res.rows[0];
  }

  async update(id: number, user: Omit<User, "id">): Promise<User | null> {
    const res = await pool.query(
      "UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, name, email, role",
      [user.name, user.email, user.role || "user", id]
    );
    return res.rows[0] ?? null;
  }

  async delete(id: number): Promise<boolean> {
    const res = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
    return (res.rowCount ?? 0) > 0;
  }
} 
