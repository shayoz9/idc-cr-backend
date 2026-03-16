import pkg from "pg";
import { env } from "./env.js";

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: env.DB_URL
});

pool.on("connect", () => {
  console.log("PostgreSQL connected");
});
