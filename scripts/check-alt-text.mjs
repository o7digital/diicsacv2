#!/usr/bin/env node
/**
 * Script para verificar atributos alt en imágenes
 * Busca en el JSON y avisa sobre imágenes sin alt
 */

import { readFileSync } from "fs";
import path from "path";

const SNAPSHOT_FILE = path.resolve("src/data/wp-snapshot.json");

function extractImages(html) {
  const imgRegex = /<img[^>]*src=["']([^"']*)["'][^>]*>/gi;
  const altRegex = /alt=["']([^"']*)["']/i;
  const images = [];

  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const imgTag = match[0];
    const src = match[1];
    const altMatch = altRegex.exec(imgTag);
    const alt = altMatch ? altMatch[1] : null;

    images.push({
      src,
      alt,
      hasAlt: !!alt,
      tag: imgTag.substring(0, 100) + "..."
    });
  }

  return images;
}

async function main() {
  try {
    const snapshotContent = readFileSync(SNAPSHOT_FILE, "utf-8");
    const snapshot = JSON.parse(snapshotContent);

    let totalImages = 0;
    let imagesWithoutAlt = 0;
    const issues = [];

    for (const page of snapshot.pages || []) {
      const images = extractImages(page.content || "");

      for (const img of images) {
        totalImages++;
        if (!img.hasAlt) {
          imagesWithoutAlt++;
          issues.push({
            page: page.path,
            image: img.src,
            issue: "Falta atributo alt"
          });
        }
      }
    }

    console.log("\n🖼️  REPORTE DE IMÁGENES\n");
    console.log(`Total de imágenes: ${totalImages}`);
    console.log(`Imágenes sin alt: ${imagesWithoutAlt} (${((imagesWithoutAlt / totalImages) * 100).toFixed(1)}%)\n`);

    if (issues.length > 0) {
      console.log("⚠️  IMÁGENES SIN ATRIBUTO ALT:\n");
      issues.slice(0, 10).forEach((issue) => {
        console.log(`  📄 ${issue.page}`);
        console.log(`     🖼️  ${issue.image}\n`);
      });

      if (issues.length > 10) {
        console.log(`  ... y ${issues.length - 10} más\n`);
      }
    } else {
      console.log("✅ Todas las imágenes tienen atributo alt\n");
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
