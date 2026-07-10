const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const localStorageProvider = require("../storage/LocalStorageProvider");

// Default conversion settings (overridable via environment variables)
const DEFAULT_PAGE_WIDTH = parseInt(process.env.FLIP_PAGE_WIDTH || "1200", 10);
const DEFAULT_QUALITY = parseInt(process.env.FLIP_QUALITY || "85", 10);
const OUTPUT_FORMAT = "webp";

class ConversionService {
  /**
   * Convert a PDF file into a folder of WebP page images for the flipbook viewer.
   *
   * @param {string} relativePdfPath - Relative path to the PDF inside storage root (e.g. "pdfs/catalogs/file.pdf")
   * @param {string} outputFolderName - The folder name for output (usually the catalogItemId)
   * @param {function} onProgress - Callback called with (processedPages, totalPages) after each page
   * @returns {Promise<{ flipPath: string, totalPages: number }>}
   */
  async convert(relativePdfPath, outputFolderName, onProgress) {
    // 1. Resolve absolute path of the source PDF
    const absolutePdfPath = localStorageProvider.resolve(relativePdfPath);
    if (!fs.existsSync(absolutePdfPath)) {
      throw new Error(`Source PDF not found: ${relativePdfPath}`);
    }

    // 2. Determine output directory
    const flipRelativePath = `flipbooks/${outputFolderName}`;
    const flipAbsolutePath = localStorageProvider.resolve(flipRelativePath);

    // 3. Clean up any previous partial conversion
    if (fs.existsSync(flipAbsolutePath)) {
      fs.rmSync(flipAbsolutePath, { recursive: true, force: true });
    }
    fs.mkdirSync(flipAbsolutePath, { recursive: true });

    // 4. Get total page count from the PDF
    const totalPages = await this._getPageCount(absolutePdfPath);
    if (totalPages === 0) {
      throw new Error("PDF has zero pages or could not be read");
    }

    // 5. Convert each page sequentially to limit memory usage
    const pageFiles = [];
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const outputFilename = `page-${pageNum}.${OUTPUT_FORMAT}`;
      const outputPath = path.join(flipAbsolutePath, outputFilename);

      await this._convertPage(absolutePdfPath, pageNum, outputPath);
      pageFiles.push(outputFilename);

      // Report progress
      if (typeof onProgress === "function") {
        onProgress(pageNum, totalPages);
      }
    }

    // 6. Write manifest.json
    const manifest = {
      totalPages,
      pageWidth: DEFAULT_PAGE_WIDTH,
      format: OUTPUT_FORMAT,
      quality: DEFAULT_QUALITY,
      pages: pageFiles,
      generatedAt: new Date().toISOString(),
    };
    await fs.promises.writeFile(
      path.join(flipAbsolutePath, "manifest.json"),
      JSON.stringify(manifest, null, 2)
    );

    return {
      flipPath: flipRelativePath,
      totalPages,
    };
  }

  /**
   * Delete a flipbook folder (cleanup on catalog deletion or re-conversion).
   * @param {string} flipRelativePath - e.g. "flipbooks/<catalogItemId>"
   */
  async cleanup(flipRelativePath) {
    if (!flipRelativePath) return;
    try {
      const absolutePath = localStorageProvider.resolve(flipRelativePath);
      if (fs.existsSync(absolutePath)) {
        fs.rmSync(absolutePath, { recursive: true, force: true });
      }
    } catch (err) {
      console.warn(`[ConversionService] Cleanup warning for ${flipRelativePath}:`, err.message);
    }
  }

  /**
   * Get the number of pages in a PDF using GraphicsMagick's identify command.
   * @private
   */
  _getPageCount(absolutePdfPath) {
    return new Promise((resolve, reject) => {
      // 1. Try pdfinfo first (faster, lighter, and doesn't require decoding page contents)
      exec(
        `pdfinfo "${absolutePdfPath}"`,
        { timeout: 15000 },
        (pdfinfoError, pdfinfoStdout) => {
          if (!pdfinfoError && pdfinfoStdout) {
            const match = pdfinfoStdout.match(/Pages:\s+(\d+)/i);
            if (match) {
              const count = parseInt(match[1], 10);
              if (!isNaN(count) && count > 0) {
                resolve(count);
                return;
              }
            }
          }

          // 2. Fallback to GraphicsMagick identify if pdfinfo failed or returned invalid results
          exec(
            `gm identify "${absolutePdfPath}"`,
            { timeout: 30000 },
            (gmError, gmStdout) => {
              if (gmError) {
                reject(
                  new Error(
                    "Cannot determine PDF page count. Ensure poppler-utils (pdfinfo) or graphicsmagick (gm) is installed, and that the PDF is valid."
                  )
                );
                return;
              }
              const lines = gmStdout.trim().split("\n").filter(line => line.trim().length > 0);
              if (lines.length > 0) {
                resolve(lines.length);
              } else {
                reject(new Error("PDF has zero pages or could not be read"));
              }
            }
          );
        }
      );
    });
  }

  /**
   * Convert a single PDF page to a WebP image using GraphicsMagick.
   * @private
   */
  _convertPage(absolutePdfPath, pageNum, outputPath) {
    return new Promise((resolve, reject) => {
      // GraphicsMagick uses 0-based page indexing
      const pageIndex = pageNum - 1;
      const density = 150; // DPI for rendering

      // gm convert: render PDF page at given DPI, resize to target width, output as WebP
      const cmd = [
        `gm convert`,
        `-density ${density}`,
        `"${absolutePdfPath}[${pageIndex}]"`,
        `-resize ${DEFAULT_PAGE_WIDTH}x`,
        `-quality ${DEFAULT_QUALITY}`,
        `+profile "*"`,
        `"${outputPath}"`,
      ].join(" ");

      exec(cmd, { timeout: 120000 }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Failed to convert page ${pageNum}: ${error.message}`));
          return;
        }
        // Verify the output file was created
        if (!fs.existsSync(outputPath)) {
          reject(new Error(`Output file not created for page ${pageNum}`));
          return;
        }
        resolve();
      });
    });
  }
}

module.exports = new ConversionService();
