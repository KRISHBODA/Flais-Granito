/**
 * PDF Flipbook Worker
 *
 * Standalone background process that polls the PdfJob collection for pending
 * conversion jobs, converts PDF pages into WebP images, and updates both the
 * PdfJob and CatalogPage documents upon completion.
 *
 * Usage:
 *   node worker/pdfWorker.js          (development)
 *   pm2 start worker/pdfWorker.js     (production)
 *
 * Environment variables:
 *   PDF_WORKER_POLL_MS   – Poll interval in ms (default: 10000)
 *   MONGO_URI            – MongoDB connection string
 *   STORAGE_ROOT         – Base storage directory
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const PdfJob = require("../models/PdfJob");
const CatalogPage = require("../models/CatalogPage");
const conversionService = require("../services/conversion/ConversionService");

// ── Configuration ────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = parseInt(process.env.PDF_WORKER_POLL_MS || "10000", 10);
const MAX_ATTEMPTS = 3;
const STALE_LOCK_MS = 10 * 60 * 1000; // 10 minutes

let isShuttingDown = false;
let pollTimer = null;

// ── MongoDB Connection ───────────────────────────────────────────────────────
async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[PdfWorker] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[PdfWorker] MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}

// ── Stale Lock Recovery ──────────────────────────────────────────────────────
// Detect jobs that were locked but the worker crashed before completing.
async function recoverStaleJobs() {
  const staleThreshold = new Date(Date.now() - STALE_LOCK_MS);

  const result = await PdfJob.updateMany(
    {
      status: "processing",
      lockedAt: { $lt: staleThreshold },
      attempts: { $lt: MAX_ATTEMPTS },
    },
    {
      $set: { status: "pending", lockedAt: null, error: "" },
    }
  );

  if (result.modifiedCount > 0) {
    console.log(`[PdfWorker] Recovered ${result.modifiedCount} stale job(s)`);
  }
}

// ── Claim Next Job ───────────────────────────────────────────────────────────
// Atomically find and lock the oldest pending job.
async function claimNextJob() {
  return PdfJob.findOneAndUpdate(
    { status: "pending", lockedAt: null },
    {
      $set: { status: "processing", lockedAt: new Date(), error: "" },
      $inc: { attempts: 1 },
    },
    { sort: { createdAt: 1 }, new: true }
  );
}

// ── Update Catalog Subdocument ───────────────────────────────────────────────
// Updates the specific catalog entry inside the CatalogPage.catalogs array.
async function updateCatalogItem(catalogPageId, catalogItemId, update) {
  await CatalogPage.updateOne(
    { _id: catalogPageId, "catalogs._id": catalogItemId },
    { $set: update }
  );
}

// ── Process a Single Job ─────────────────────────────────────────────────────
async function processJob(job) {
  const jobId = job._id.toString();
  const itemId = job.catalogItemId.toString();
  console.log(`[PdfWorker] Processing job ${jobId} for catalog item ${itemId}`);
  console.log(`[PdfWorker]   PDF: ${job.originalPdfPath}`);
  console.log(`[PdfWorker]   Attempt: ${job.attempts}/${MAX_ATTEMPTS}`);

  try {
    // Update catalog status to processing
    await updateCatalogItem(job.catalogPageId, job.catalogItemId, {
      "catalogs.$.conversionStatus": "processing",
    });

    // Run conversion with progress tracking
    const result = await conversionService.convert(
      job.originalPdfPath,
      itemId,
      async (processedPages, totalPages) => {
        // Update progress in-place (non-blocking, fire-and-forget)
        const progress = Math.round((processedPages / totalPages) * 100);
        PdfJob.updateOne(
          { _id: job._id },
          { $set: { processedPages, totalPages, progress } }
        ).catch(() => {}); // Swallow progress update errors
      }
    );

    // ── Success ──────────────────────────────────────────────────
    await PdfJob.updateOne(
      { _id: job._id },
      {
        $set: {
          status: "completed",
          flipPath: result.flipPath,
          totalPages: result.totalPages,
          processedPages: result.totalPages,
          progress: 100,
          completedAt: new Date(),
        },
      }
    );

    await updateCatalogItem(job.catalogPageId, job.catalogItemId, {
      "catalogs.$.flipPath": result.flipPath,
      "catalogs.$.conversionStatus": "completed",
    });

    console.log(
      `[PdfWorker] ✓ Job ${jobId} completed — ${result.totalPages} pages → ${result.flipPath}`
    );
  } catch (error) {
    console.error(`[PdfWorker] ✗ Job ${jobId} failed:`, error.message);

    // Clean up partial output
    const partialFlipPath = `flipbooks/${itemId}`;
    await conversionService.cleanup(partialFlipPath);

    if (job.attempts >= MAX_ATTEMPTS) {
      // Permanently failed
      await PdfJob.updateOne(
        { _id: job._id },
        {
          $set: {
            status: "failed",
            error: error.message,
            lockedAt: null,
          },
        }
      );
      await updateCatalogItem(job.catalogPageId, job.catalogItemId, {
        "catalogs.$.conversionStatus": "failed",
      });
      console.log(`[PdfWorker]   Permanently failed after ${MAX_ATTEMPTS} attempts`);
    } else {
      // Allow retry
      await PdfJob.updateOne(
        { _id: job._id },
        {
          $set: {
            status: "pending",
            error: error.message,
            lockedAt: null,
            progress: 0,
            processedPages: 0,
          },
        }
      );
      await updateCatalogItem(job.catalogPageId, job.catalogItemId, {
        "catalogs.$.conversionStatus": "pending",
      });
      console.log(`[PdfWorker]   Will retry (attempt ${job.attempts}/${MAX_ATTEMPTS})`);
    }
  }
}

// ── Poll Loop ────────────────────────────────────────────────────────────────
async function poll() {
  if (isShuttingDown) return;

  try {
    // Recover stale jobs on each poll cycle
    await recoverStaleJobs();

    // Claim and process the next job
    const job = await claimNextJob();

    if (job) {
      await processJob(job);
      // If a job was processed, check immediately for more (no delay)
      if (!isShuttingDown) {
        setImmediate(poll);
        return;
      }
    }
  } catch (error) {
    console.error("[PdfWorker] Poll error:", error.message);
  }

  // Schedule next poll
  if (!isShuttingDown) {
    pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
  }
}

// ── Graceful Shutdown ────────────────────────────────────────────────────────
function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n[PdfWorker] Received ${signal}, shutting down gracefully...`);

  if (pollTimer) {
    clearTimeout(pollTimer);
  }

  mongoose.connection
    .close()
    .then(() => {
      console.log("[PdfWorker] MongoDB connection closed");
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("[PdfWorker] Starting PDF Flipbook Worker...");
  console.log(`[PdfWorker] Poll interval: ${POLL_INTERVAL_MS}ms`);
  console.log(`[PdfWorker] Max attempts per job: ${MAX_ATTEMPTS}`);
  console.log(`[PdfWorker] Stale lock timeout: ${STALE_LOCK_MS / 1000}s`);

  await connectDB();

  // Start polling
  poll();
}

main().catch((err) => {
  console.error("[PdfWorker] Fatal error:", err);
  process.exit(1);
});
