const CatalogPage = require("../models/CatalogPage");
const PdfJob = require("../models/PdfJob");
const conversionService = require("../services/conversion/ConversionService");

const DEFAULT_CATALOG = {
  pageSettings: {
    heroTitle: "DOWNLOAD CATALOGS",
    heroSubtitle: "Explore and download our premium vitrified tiles collection brochures.",
    heroMedia: ""
  },
  catalogs: []
};

function normalizeCatalogItem(cat = {}) {
  return {
    ...cat,
    availableSizes: cat.availableSizes ?? "",
    thickness: cat.thickness ?? "",
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Check whether a link string looks like a PDF path/URL.
 */
function isPdfLink(link) {
  if (!link || link === "#") return false;
  return /\.pdf(\?.*)?$/i.test(link);
}

/**
 * Extract the relative storage path from a full URL or relative path.
 * e.g. "http://localhost:8000/media/pdfs/catalogs/file.pdf" → "pdfs/catalogs/file.pdf"
 */
function extractRelativePath(urlOrPath) {
  if (!urlOrPath) return "";
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
    try {
      const url = new URL(urlOrPath);
      let pathname = url.pathname;
      if (pathname.startsWith("/media/")) {
        return pathname.substring(7); // Remove "/media/"
      }
      if (pathname.startsWith("/uploads/")) {
        return pathname.substring(9); // Remove "/uploads/"
      }
      if (pathname.startsWith("/")) {
        return pathname.substring(1);
      }
      return pathname;
    } catch {
      return urlOrPath;
    }
  }
  return urlOrPath;
}

// ── Controllers ──────────────────────────────────────────────────────────────

exports.getCatalogPage = async (req, res) => {
  try {
    let catalog = await CatalogPage.findOne();
    if (!catalog) {
      catalog = await CatalogPage.create(DEFAULT_CATALOG);
    } else {
      // Migrate / assign unique sequence numbers to existing catalogs if missing or duplicate
      let updated = false;
      if (catalog.catalogs && Array.isArray(catalog.catalogs)) {
        const seenSeqNums = new Set();
        let maxSeq = 0;
        catalog.catalogs.forEach(cat => {
          if (cat.sequenceNumber !== undefined && cat.sequenceNumber !== null && cat.sequenceNumber > maxSeq) {
            maxSeq = cat.sequenceNumber;
          }
        });

        catalog.catalogs = catalog.catalogs.map((cat, idx) => {
          const normalizedCat = normalizeCatalogItem(cat.toObject ? cat.toObject() : cat);
          if (
            normalizedCat.sequenceNumber === undefined ||
            normalizedCat.sequenceNumber === null ||
            seenSeqNums.has(normalizedCat.sequenceNumber)
          ) {
            maxSeq += 1;
            normalizedCat.sequenceNumber = maxSeq;
            updated = true;
          }
          if (normalizedCat.availableSizes !== (cat.availableSizes ?? "")) {
            updated = true;
          }
          if (normalizedCat.thickness !== (cat.thickness ?? "")) {
            updated = true;
          }
          seenSeqNums.add(normalizedCat.sequenceNumber);
          return normalizedCat;
        });
      }

      if (updated) {
        catalog.markModified('catalogs');
        await catalog.save();
      }
    }
    res.status(200).json({ success: true, catalog });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.upsertCatalogPage = async (req, res) => {
  try {
    const payload = req.body?.catalog ? req.body.catalog : req.body;

    if (payload.catalogs && Array.isArray(payload.catalogs)) {
      payload.catalogs = payload.catalogs.map(normalizeCatalogItem);
    }

    // Validate that sequence numbers are unique
    if (payload.catalogs && Array.isArray(payload.catalogs)) {
      const seqNums = payload.catalogs.map(cat => cat.sequenceNumber).filter(num => num !== undefined && num !== null);
      const uniqueSeqNums = new Set(seqNums);
      if (seqNums.length !== uniqueSeqNums.size) {
        return res.status(400).json({ success: false, message: "Catalog sequence numbers must be unique and cannot be repeated." });
      }
    }

    // Fetch the current document BEFORE updating so we can compare PDF links
    const oldDoc = await CatalogPage.findOne();
    const oldCatalogs = oldDoc ? oldDoc.catalogs : [];

    // Build a map of old catalog items by _id for quick lookup
    const oldCatalogMap = new Map();
    for (const cat of oldCatalogs) {
      if (cat._id) {
        oldCatalogMap.set(cat._id.toString(), cat);
      }
    }

    // Perform the upsert (existing behavior, unchanged)
    const catalog = await CatalogPage.findOneAndUpdate({}, payload, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    // ── Detect PDF link changes and create conversion jobs ────────────────
    // After the update, compare each catalog item's link to the old version.
    // If a PDF link was added or changed, create a PdfJob for background conversion.
    const jobsCreated = [];

    for (const newCat of catalog.catalogs) {
      const itemId = newCat._id.toString();
      const oldCat = oldCatalogMap.get(itemId);
      const newLink = newCat.link || "";
      const oldLink = oldCat ? (oldCat.link || "") : "";

      // Only create a job if:
      // 1. The link actually changed (or it's a brand new catalog entry)
      // 2. The new link is a PDF
      if (newLink !== oldLink && isPdfLink(newLink)) {
        const relativePdfPath = extractRelativePath(newLink);

        // Cancel any previous pending/processing jobs for this catalog item
        await PdfJob.updateMany(
          { catalogItemId: newCat._id, status: { $in: ["pending", "processing"] } },
          { $set: { status: "failed", error: "Superseded by new upload" } }
        );

        // Clean up old flipbook assets if they exist
        if (oldCat && oldCat.flipPath) {
          conversionService.cleanup(oldCat.flipPath).catch(() => {});
        }

        // Create a new PdfJob
        const job = await PdfJob.create({
          catalogPageId: catalog._id,
          catalogItemId: newCat._id,
          originalPdfPath: relativePdfPath,
          status: "pending",
        });

        // Set the catalog item's conversion status to pending
        await CatalogPage.updateOne(
          { _id: catalog._id, "catalogs._id": newCat._id },
          {
            $set: {
              "catalogs.$.conversionStatus": "pending",
              "catalogs.$.flipPath": "",
            },
          }
        );

        jobsCreated.push({
          catalogItemId: itemId,
          jobId: job._id.toString(),
        });
      }
    }

    // Re-fetch the document to include the updated conversionStatus values
    const updatedCatalog = await CatalogPage.findOne();

    res.status(200).json({
      success: true,
      message: "Catalog page settings updated",
      catalog: updatedCatalog,
      jobsCreated: jobsCreated.length > 0 ? jobsCreated : undefined,
    });
  } catch (error) {
    console.error("[catalogController] upsertCatalogPage error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getCatalogJobStatus = async (req, res) => {
  try {
    const { catalogItemId } = req.params;
    if (!catalogItemId) {
      return res.status(400).json({ success: false, message: "catalogItemId is required" });
    }

    const job = await PdfJob.findOne({ catalogItemId })
      .sort({ createdAt: -1 })
      .lean();

    if (!job) {
      return res.status(200).json({ success: true, job: null });
    }

    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
