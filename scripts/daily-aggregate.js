#!/usr/bin/env node
// Daily aggregation scheduler — runs as a background process alongside the server.
// Aggregates yesterday's search data every 24 hours (at ~midnight UTC).

const CRON_SECRET = process.env.CRON_SECRET;
const PORT = process.env.PORT || "3000";
const BASE_URL = `http://localhost:${PORT}`;

if (!CRON_SECRET) {
  console.log("[cron] CRON_SECRET not set, daily aggregation disabled");
  process.exit(0);
}

function msUntilMidnightUTC() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 10, 0, 0); // 00:10 UTC to avoid boundary issues
  return tomorrow.getTime() - now.getTime();
}

async function runAggregation() {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/search-analytics/auto-aggregate`, {
      method: "POST",
      headers: { "x-cron-secret": CRON_SECRET },
    });
    const data = await res.json();
    console.log(`[cron] Aggregation result:`, data);
  } catch (err) {
    console.error(`[cron] Aggregation failed:`, err.message);
  }
}

// Wait for the server to start, then run initial aggregation
setTimeout(async () => {
  console.log("[cron] Running initial aggregation...");
  await runAggregation();

  // Schedule next run at midnight UTC
  function scheduleNext() {
    const ms = msUntilMidnightUTC();
    const hours = Math.round(ms / 1000 / 60 / 60 * 10) / 10;
    console.log(`[cron] Next aggregation in ${hours}h`);
    setTimeout(async () => {
      console.log("[cron] Running scheduled aggregation...");
      await runAggregation();
      scheduleNext();
    }, ms);
  }

  scheduleNext();
}, 15000); // 15s delay for server startup

console.log("[cron] Daily aggregation scheduler started");
