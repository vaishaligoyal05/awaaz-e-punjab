import mongoose from "mongoose";

const districtSchema = new mongoose.Schema({
  fin_year: String,
  month: String,
  state_code: String,
  state_name: String,
  district_code: String,
  district_name: String,
  raw: mongoose.Schema.Types.Mixed, // store raw JSON row
  fetchedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// unique index to upsert by these keys
districtSchema.index({ state_name: 1, district_code: 1, fin_year: 1, month: 1 }, { unique: true });

// const District = mongoose.model("District", districtSchema);
export default mongoose.model("DistrictData", districtSchema, "districts");

