import express from "express";
import { syncPunjabData, getLatestPunjab, getDistrictRecords } from "../controllers/mgnregaController.js";
const router = express.Router();

router.get("/sync", syncPunjabData); // manual trigger (protected later)
router.get("/latest", getLatestPunjab); // latest row per district
router.get("/district/:id", getDistrictRecords); // by district_code or district_name

export default router;
