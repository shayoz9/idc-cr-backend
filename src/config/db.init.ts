import { pool } from "./db.js";

export async function initializeDatabase(): Promise<void> {
  try {
    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user' CHECK(role IN ('admin', 'user', 'moderator')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Add role column if it doesn't exist (for existing tables)
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user' CHECK(role IN ('admin', 'user', 'moderator'));
    `);
    console.log("Users table ensured");

    // Create tasks table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT DEFAULT '',
        status VARCHAR(50) DEFAULT 'TODO' CHECK(status IN ('TODO', 'IN_PROGRESS', 'DONE')),
        priority VARCHAR(50) DEFAULT 'MEDIUM' CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH')),
        dueDate TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tasks table ensured");

    // Create indexes for better query performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_status_createdAt ON tasks(status, createdAt DESC);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_priority_dueDate ON tasks(priority, dueDate);
    `);
    console.log("Task indexes created");

    console.log("Database initialization completed");

  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}
