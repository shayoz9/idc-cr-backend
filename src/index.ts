import "dotenv/config";
import { app } from "./app.js";
import { env } from "./config/env.js";

import { initializeDatabase } from "./config/db.init.js";

// Initialize database tables on startup
await initializeDatabase();

app.get("/health", (_req, res) => {
  res.send("OK");
});

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});

