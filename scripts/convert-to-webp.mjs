#!/usr/bin/env node
/**
 * Script pour convertir images JPG/PNG/GIF en WebP
 * Usage: node scripts/convert-to-webp.mjs
 */

import { existsSync, readdirSync, statSync } from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import process from "process";

const execPromise = promisify(exec);
const UPLOADS_DIR = path.resolve("public/wp-content/uploads");

async function findImages(dir, extensions = [".jpg", ".jpeg", ".png", ".gif"]) {
  const images = [];

  if (!existsSync(dir)) {
    console.error(`❌ Directorio no encontrado: ${dir}`);
    return images;
  }

  function walk(currentPath) {
    const entries = readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (extensions.includes(ext)) {
          images.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return images;
}

async function convertToWebp(inputPath) {
  const outputPath = inputPath.replace(/\.(jpg|jpeg|png|gif)$/i, ".webp");

  if (existsSync(outputPath)) {
    console.log(`⏭️  Ya existe: ${outputPath}`);
    return;
  }

  try {
    // Usar ImageMagick o ffmpeg si está disponible
    // Intenta primero con 'magick' (ImageMagick)
    try {
      await execPromise(`magick "${inputPath}" -quality 85 -define webp:method=6 "${outputPath}"`);
    } catch {
      // Fallback a 'convert' (ImageMagick alternativo)
      await execPromise(`convert "${inputPath}" -quality 85 -define webp:method=6 "${outputPath}"`);
    }

    const inputSize = statSync(inputPath).size;
    const outputSize = statSync(outputPath).size;
    const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);

    console.log(`✅ Convertido: ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
    console.log(`   Ahorro: ${savings}% (${(inputSize / 1024 / 1024).toFixed(2)}MB → ${(outputSize / 1024 / 1024).toFixed(2)}MB)`);
  } catch (error) {
    console.error(`❌ Error convertiendo ${inputPath}:`, error.message);
  }
}

async function main() {
  console.log("🖼️  Buscando imágenes JPG/PNG/GIF...\n");

  const images = await findImages(UPLOADS_DIR);
  console.log(`Encontradas ${images.length} imágenes\n`);

  if (images.length === 0) {
    console.log("✨ No hay imágenes para convertir");
    return;
  }

  console.log("⏳ Iniciando conversión a WebP...\n");

  for (const imagePath of images) {
    await convertToWebp(imagePath);
  }

  console.log("\n✨ Conversión completada!");
}

main().catch((error) => {
  console.error("Error fatal:", error);
  process.exit(1);
});
