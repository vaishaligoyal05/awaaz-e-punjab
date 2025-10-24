import axios from "axios";
import District from "../models/District.js";
import SyncStatus from "../models/SyncStatus.js";

// fetch with retries
async function fetchWithRetry(url, opts = {}, retries = 5, backoff = 500) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await axios.get(url, opts);
      return res.data;
    } catch (err) {
      if (i === retries) throw err;
      const wait = backoff * Math.pow(2, i);
      console.warn(`Fetch failed (attempt ${i + 1}). Retrying in ${wait}ms`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
}

// Sync function
export async function syncPunjabData(req, res) {
  let totalFetched = 0;
  try {
    const resourceId = process.env.RESOURCE_ID;
    const apiKey = process.env.DATA_GOV_API_KEY;
    if (!resourceId || !apiKey) {
      return res.status(500).json({ message: "Missing RESOURCE_ID or API_KEY in .env" });
    }

    // Fetch only new data since last sync
    const lastSyncDoc = await SyncStatus.findOne().sort({ lastSync: -1 });
    let lastSyncTime = lastSyncDoc ? lastSyncDoc.lastSync : null;

    const limit = 5000;
    let offset = 0;
    const baseUrl = `https://api.data.gov.in/resource/${resourceId}`;
    const upsertOps = [];

    while (true) {
      let url = `${baseUrl}?api-key=${apiKey}&format=json&limit=${limit}&offset=${offset}&filters[state_name]=PUNJAB`;
      const data = await fetchWithRetry(url, {}, 5, 500);
      if (!data || !data.records) break;

      for (const row of data.records) {
        // skip old records if lastSyncTime is defined
        const fetchedDate = new Date(row.updated_at || row.fetchedAt || Date.now());
        if (lastSyncTime && fetchedDate <= lastSyncTime) continue;

        const filter = {
          state_name: (row.state_name || "").toUpperCase(),
          district_code: row.district_code,
          fin_year: row.fin_year,
          month: row.month
        };

        const update = {
          $set: {
            fin_year: row.fin_year,
            month: row.month,
            state_code: row.state_code,
            state_name: (row.state_name || "").toUpperCase(),
            district_code: row.district_code,
            district_name: row.district_name,
            raw: row,
            fetchedAt: new Date()
          }
        };

        upsertOps.push({ updateOne: { filter, update, upsert: true } });
      }

      totalFetched += data.records.length;
      if (!data.records || data.records.length < limit) break;
      offset += limit;
    }

    // Bulk write
    const BATCH = 1000;
    for (let i = 0; i < upsertOps.length; i += BATCH) {
      const batchOps = upsertOps.slice(i, i + BATCH);
      await District.bulkWrite(batchOps, { ordered: false });
    }

    // Mark sync success
    await SyncStatus.create({ lastSync: new Date(), success: true });

    return res.json({ ok: true, fetched: totalFetched, upserted: upsertOps.length });

  } catch (err) {
    console.error("Sync error:", err?.response?.data || err.message || err);
    await SyncStatus.create({ lastSync: new Date(), success: false, error: err.message || "Unknown" });
    return res.status(500).json({ message: "Sync failed", error: err.message || err });
  }
}

// Get latest & district records remain the same
export async function getLatestPunjab(req, res) {
  try {
    const pipeline = [
      { $match: { state_name: "PUNJAB" } },
      { $sort: { district_code: 1, fetchedAt: -1 } },
      { $group: { _id: "$district_code", doc: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$doc" } },
      { $sort: { district_name: 1 } }
    ];
    const rows = await District.aggregate(pipeline);
    const mapped = rows.map(r => r.raw || r);
    return res.json({ count: mapped.length, data: mapped });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getDistrictRecords(req, res) {
  try {
    const id = req.params.id;
    const q = isNaN(Number(id)) ? { district_name: { $regex: new RegExp(id, "i") } } : { district_code: id };
    const rows = await District.find(q).sort({ fin_year: -1, month: -1 });
    if (!rows.length) return res.status(404).json({ message: "No records found" });
    const mapped = rows.map(r => r.raw || r);
    return res.json({ count: mapped.length, data: mapped });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
