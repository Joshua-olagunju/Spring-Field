/**
 * PWA Icon Generator Script
 *
 * This script generates PWA icons in various sizes from the source logo.
 * Run with: node scripts/generate-pwa-icons.js
 *
 * Requirements: npm install sharp
 */

/* eslint-disable no-undef */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Icon sizes required for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Paths
const inputLogo = path.join(__dirname, "..", "src", "assets", "icon.jpg");
const outputDir = path.join(__dirname, "..", "public", "icons");

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log("🎨 Generating PWA icons...\n");

// Generate icons for each size
async function generateIcons() {
  try {
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

      await sharp(inputLogo)
        .resize(size, size, {
          fit: "contain",
          background: { r: 59, g: 130, b: 246, alpha: 1 }, // Blue background
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated ${size}x${size} icon`);
    }

    console.log("\n🎉 All icons generated successfully!");
    console.log(`📁 Icons saved to: ${outputDir}`);
  } catch (error) {
    console.error("❌ Error generating icons:", error);
    process.exit(1);
  }
}

generateIcons();
