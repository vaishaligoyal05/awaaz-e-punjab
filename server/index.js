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

// =======================================================
// 🧱 Serve React frontend (for Render / Production)
// =======================================================

// ES Modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define path to React build
const buildPath = path.join(__dirname, "../client/dist");

// Serve static frontend files
app.use(express.static(buildPath));

// For any route not starting with /api, send React index.html
app.use(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// =======================================================
// 🕒 Background sync job
// =======================================================
startSyncJob();

// =======================================================
// 🚀 Start server
// =======================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
