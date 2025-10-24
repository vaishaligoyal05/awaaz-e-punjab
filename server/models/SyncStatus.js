import mongoose from "mongoose";

const syncSchema = new mongoose.Schema({
  lastSync: { type: Date, default: Date.now },
  success: { type: Boolean, default: true },
  error: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("SyncStatus", syncSchema);
    