/**
 * Simple PWA Icon Generator using Canvas
 * This creates basic icons from your logo without needing external packages
 *
 * Run with: node scripts/simple-icon-generator.js
 */

/* eslint-disable no-undef */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const logoPath = path.join(__dirname, "..", "src", "assets", "icon.jpg");
const iconsDir = path.join(__dirname, "..", "public", "icons");

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// For now, just copy the logo to all icon sizes
// This will make the PWA work - you can generate proper sizes later with the web tool
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log("📋 Creating placeholder icons from logo...\n");

sizes.forEach((size) => {
  const destPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  fs.copyFileSync(logoPath, destPath);
  console.log(`✅ Created icon-${size}x${size}.png`);
});

console.log("\n✨ Icons created from your icon.jpg!");
console.log(
  "📝 Note: For best results, use the web tool to create properly sized icons:"
);
console.log("   http://localhost:5173/generate-icons.html");
console.log("   Upload: src/assets/icon.jpg\n");
