/**
 * PDF Flipbook Worker
 *
 * Background polling loop that runs inside the main server process.
 * Checks the PdfJob collection for pending conversion jobs, converts
 * PDF pages into WebP images, and updates both PdfJob and CatalogPage.
 *
 * Usage:
 *   const pdfWorker = require("./worker/pdfWorker");
 *   pdfWorker.start();   // call after server is listening
 *
 * Environment variables:
 *   PDF_WORKER_POLL_MS   – Poll interval in ms (default: 10000)
 */

const PdfJob = require("../models/PdfJob");
const CatalogPage = require("../models/CatalogPage");
const conversionService = require("../services/conversion/ConversionService");

// ── Configuration ────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = parseInt(process.env.PDF_WORKER_POLL_MS || "10000", 10);
const MAX_ATTEMPTS = 3;
const STALE_LOCK_MS = 10 * 60 * 1000; // 10 minutes

let isRunning = false;
let pollTimer = null;

// ── Stale Lock Recovery ──────────────────────────────────────────────────────
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
        const progress = Math.round((processedPages / totalPages) * 100);
        PdfJob.updateOne(
          { _id: job._id },
          { $set: { processedPages, totalPages, progress } }
        ).catch(() => {});
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
  if (!isRunning) return;

  try {
    await recoverStaleJobs();

    const job = await claimNextJob();

    if (job) {
      await processJob(job);
      // If a job was processed, check immediately for more
      if (isRunning) {
        setImmediate(poll);
        return;
      }
    }
  } catch (error) {
    console.error("[PdfWorker] Poll error:", error.message);
  }

  // Schedule next poll
  if (isRunning) {
    pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Start the worker polling loop.
 * Call this after MongoDB is connected and server is listening.
 */
function start() {
  if (isRunning) return;
  isRunning = true;

  console.log("[PdfWorker] Starting PDF Flipbook Worker...");
  console.log(`[PdfWorker] Poll interval: ${POLL_INTERVAL_MS}ms`);
  console.log(`[PdfWorker] Max attempts per job: ${MAX_ATTEMPTS}`);

  poll();
}

/**
 * Stop the worker polling loop gracefully.
 */
function stop() {
  isRunning = false;
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
  console.log("[PdfWorker] Stopped.");
}

module.exports = { start, stop };
