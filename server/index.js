import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import mgnregaRoutes from "./routes/mgnregaRoutes.js";
import startSyncJob from "./jobs/syncJob.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
await connectDB();

// API routes
app.use("/api/mgnrega", mgnregaRoutes);

// Serve React frontend (Vite build output is in "client/dist")
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "client/dist")));

// Catch-all route for React
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist/index.html"));
});

// Start cron job
startSyncJob();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
