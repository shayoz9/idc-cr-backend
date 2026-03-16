import { pool } from "../config/db.js";
import { Task, TaskStatus, TaskPriority } from "../model/task.js";

export class TaskRepository {
  async findAll(): Promise<Task[]> {
    const res = await pool.query(
      "SELECT id, title, description, status, priority, dueDate, createdAt, updatedAt FROM tasks ORDER BY createdAt DESC"
    );
    return res.rows;
  }

  async findById(id: number): Promise<Task | null> {
    const res = await pool.query(
      "SELECT id, title, description, status, priority, dueDate, createdAt, updatedAt FROM tasks WHERE id = $1",
      [id]
    );
    return res.rows[0] ?? null;
  }

  async findByStatus(status: TaskStatus): Promise<Task[]> {
    const res = await pool.query(
      "SELECT id, title, description, status, priority, dueDate, createdAt, updatedAt FROM tasks WHERE status = $1 ORDER BY createdAt DESC",
      [status]
    );
    return res.rows;
  }

  async create(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> {
    const { title, description, priority, dueDate, status } = task;

    const res = await pool.query(
      `INSERT INTO tasks(title, description, status, priority, dueDate, createdAt, updatedAt) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
       RETURNING id, title, description, status, priority, dueDate, createdAt, updatedAt`,
      [title, description || "", status || "TODO", priority || "MEDIUM", dueDate || null]
    );
    return res.rows[0];
  }

  async update(id: number, task: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>): Promise<Task | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (task.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(task.title);
    }
    if (task.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(task.description);
    }
    if (task.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(task.status);
    }
    if (task.priority !== undefined) {
      fields.push(`priority = $${paramCount++}`);
      values.push(task.priority);
    }
    if (task.dueDate !== undefined) {
      fields.push(`dueDate = $${paramCount++}`);
      values.push(task.dueDate);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updatedAt = NOW()`);
    values.push(id);

    const res = await pool.query(
      `UPDATE tasks SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING id, title, description, status, priority, dueDate, createdAt, updatedAt`,
      values
    );
    return res.rows[0] ?? null;
  }

  async delete(id: number): Promise<boolean> {
    const res = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING id", [id]);
    return (res.rowCount ?? 0) > 0;
  }
}
