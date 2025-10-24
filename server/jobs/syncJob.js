// import cron from "node-cron";
// import axios from "axios";

// /**
//  * We'll call the /api/mgnrega/sync endpoint internally (or call the sync function directly).
//  * For simplicity we will import controller if required; but to avoid circular imports we can call endpoint.
//  */
// import http from "http";

// function startSyncJob() {
//   const schedule = process.env.SYNC_CRON_SCHEDULE || "0 3 * * *"; // default daily 03:00
//   cron.schedule(schedule, async () => {
//     try {
//       console.log(`[syncJob] Running scheduled sync at ${new Date().toISOString()}`);
//       // If local server is up, call sync route
//       const port = process.env.PORT || 5000;
//       const res = await axios.get(`http://localhost:${port}/api/mgnrega/sync`, { timeout: 10 * 60 * 1000 });
//       console.log(`[syncJob] Sync result:`, res.data);
//     } catch (err) {
//       console.error("[syncJob] scheduled sync failed:", err?.message || err);
//     }
//   }, { scheduled: true });

//   console.log(`[syncJob] Scheduled sync job set: ${schedule}`);
// }

// export default startSyncJob;
import cron from "node-cron";
import axios from "axios";
import SyncStatus from "../models/SyncStatus.js";

function startSyncJob() {
  const schedule = process.env.SYNC_CRON_SCHEDULE || "0 3 * * *"; // daily 3AM
  cron.schedule(schedule, async () => {
    try {
      console.log(`[syncJob] Running scheduled sync at ${new Date().toISOString()}`);
      const port = process.env.PORT || 5000;
      const res = await axios.get(`http://localhost:${port}/api/mgnrega/sync`, { timeout: 10 * 60 * 1000 });
      console.log(`[syncJob] Sync result:`, res.data);
    } catch (err) {
      console.error("[syncJob] scheduled sync failed:", err?.message || err);
      await SyncStatus.create({ lastSync: new Date(), success: false, error: err.message || "Unknown" });
    }
  }, { scheduled: true });

  console.log(`[syncJob] Scheduled sync job set: ${schedule}`);
}

export default startSyncJob;
