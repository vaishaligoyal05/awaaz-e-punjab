    import express from "express";
    import dotenv from "dotenv";
    import cors from "cors";
    import connectDB from "./config/db.js";
    import mgnregaRoutes from "./routes/mgnregaRoutes.js";
    import startSyncJob from "./jobs/syncJob.js";

    dotenv.config();
    const app = express();
    app.use(cors());
    app.use(express.json());

    await connectDB();

    app.get("/", (req, res) => res.send("Awaaz-e-Punjab server running"));
    app.use("/api/mgnrega", mgnregaRoutes);

    // start scheduled sync job (cron)
    startSyncJob();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
