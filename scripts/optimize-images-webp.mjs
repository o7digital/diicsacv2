#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const PUBLIC_DIR = path.resolve("public");
const SNAPSHOT_PATH = path.resolve("src/data/wp-snapshot.json");
const QUALITY = Number(process.env.WEBP_QUALITY ?? 82);
const MIN_BYTES = Number(process.env.WEBP_MIN_SAVING_BYTES ?? 1024);
const MAX_RATIO = Number(process.env.WEBP_MAX_RATIO ?? 0.98);
const MIN_SOURCE_SIZE = Number(process.env.WEBP_MIN_SOURCE_BYTES ?? 4096);
const SOURCE_DIRS = ["wp-content/uploads", "wp-content/themes", "wp-content/plugins"].map((value) =>
  path.join(PUBLIC_DIR, value)
);
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

function log(message) {
  console.log(`[images-webp] ${message}`);
}

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function toWebPath(absolutePath) {
  return `/${toPosixPath(path.relative(PUBLIC_DIR, absolutePath))}`;
}

async function walkFiles(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function convertToWebp(sourcePath, outputPath) {
  const result = spawnSync("cwebp", ["-quiet", "-q", String(QUALITY), sourcePath, "-o", outputPath], {
    encoding: "utf8"
  });
  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || "echec de conversion cwebp");
  }
}

function shouldUseWebp(sourceSize, webpSize) {
  return webpSize + MIN_BYTES < sourceSize && webpSize / sourceSize <= MAX_RATIO;
}

function replaceEscapedPath(value) {
  return value.replaceAll("/", "\\/");
}

function replaceFromMapping(markup, mappingEntries) {
  let updated = markup;
  for (const [fromPath, toPath] of mappingEntries) {
    if (!updated.includes(fromPath) && !updated.includes(replaceEscapedPath(fromPath))) {
      continue;
    }

    updated = updated.split(fromPath).join(toPath);
    updated = updated.split(replaceEscapedPath(fromPath)).join(replaceEscapedPath(toPath));
  }
  return updated;
}

function splitPathSuffix(rawPath) {
  const match = rawPath.match(/^([^?#]*)(.*)$/);
  return {
    pathname: match?.[1] ?? rawPath,
    suffix: match?.[2] ?? ""
  };
}

function resolveCssReference(cssWebPath, rawReference) {
  const trimmed = rawReference.trim().replace(/^['"]|['"]$/g, "");
  if (
    trimmed.length === 0 ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("http:") ||
    trimmed.startsWith("https:") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("#")
  ) {
    return null;
  }

  const { pathname } = splitPathSuffix(trimmed);
  if (!pathname) {
    return null;
  }

  if (pathname.startsWith("/")) {
    return path.posix.normalize(pathname);
  }

  const cssDir = path.posix.dirname(cssWebPath);
  return path.posix.normalize(path.posix.join(cssDir, pathname));
}

function rewriteCssReference(cssWebPath, originalReference, targetWebPath) {
  const trimmed = originalReference.trim();
  const quote = trimmed.startsWith("\"") ? "\"" : trimmed.startsWith("'") ? "'" : "";
  const unquoted = trimmed.replace(/^['"]|['"]$/g, "");
  const { pathname, suffix } = splitPathSuffix(unquoted);
  const cssDir = path.posix.dirname(cssWebPath);

  let rewritten;
  if (pathname.startsWith("/")) {
    rewritten = targetWebPath;
  } else {
    rewritten = path.posix.relative(cssDir, targetWebPath);
    if (!rewritten || rewritten === "") {
      rewritten = path.posix.basename(targetWebPath);
    }
  }

  const joined = `${rewritten}${suffix}`;
  return quote ? `${quote}${joined}${quote}` : joined;
}

function applyMappingToCss(content, cssAbsolutePath, mapping) {
  const cssWebPath = toWebPath(cssAbsolutePath);

  let updated = content.replace(/url\(([^)]+)\)/gi, (full, rawReference) => {
    const resolved = resolveCssReference(cssWebPath, rawReference);
    if (!resolved) {
      return full;
    }

    const target = mapping.get(resolved);
    if (!target) {
      return full;
    }

    const rewritten = rewriteCssReference(cssWebPath, rawReference, target);
    return `url(${rewritten})`;
  });

  // Some CSS files contain absolute paths as plain strings outside url(...).
  updated = replaceFromMapping(updated, mapping.entries());
  return updated;
}

async function main() {
  const cwebpCheck = spawnSync("cwebp", ["-version"], { encoding: "utf8" });
  if (cwebpCheck.status !== 0) {
    throw new Error("cwebp introuvable. Installe webp (`brew install webp`) puis relance.");
  }

  const mapping = new Map();
  let scanned = 0;
  let converted = 0;
  let keptExisting = 0;
  let skipped = 0;
  let totalSavedBytes = 0;

  for (const sourceDir of SOURCE_DIRS) {
    if (!existsSync(sourceDir)) {
      continue;
    }

    const files = await walkFiles(sourceDir);
    for (const filePath of files) {
      const extension = path.extname(filePath).toLowerCase();
      if (!IMAGE_EXTENSIONS.has(extension)) {
        continue;
      }

      const sourceStats = await stat(filePath);
      scanned += 1;
      if (sourceStats.size < MIN_SOURCE_SIZE) {
        skipped += 1;
        continue;
      }

      const webpPath = filePath.replace(/\.(?:png|jpe?g)$/i, ".webp");
      let webpExists = existsSync(webpPath);

      if (!webpExists) {
        try {
          convertToWebp(filePath, webpPath);
          webpExists = true;
          converted += 1;
        } catch {
          skipped += 1;
          continue;
        }
      } else {
        keptExisting += 1;
      }

      const webpStats = await stat(webpPath);
      if (!shouldUseWebp(sourceStats.size, webpStats.size)) {
        if (converted > 0 && !keptExisting) {
          // no-op, intentionally keep existing webp files generated by WP/theme.
        }
        skipped += 1;
        continue;
      }

      const sourceWebPath = toWebPath(filePath);
      const targetWebPath = toWebPath(webpPath);
      mapping.set(sourceWebPath, targetWebPath);
      totalSavedBytes += sourceStats.size - webpStats.size;
    }
  }

  log(`Images scannees: ${scanned}`);
  log(`WebP convertis: ${converted}`);
  log(`WebP deja presents: ${keptExisting}`);
  log(`Replacements retenus: ${mapping.size}`);

  if (mapping.size === 0) {
    log("Aucun remplacement utile trouve.");
    return;
  }

  const snapshot = JSON.parse(await readFile(SNAPSHOT_PATH, "utf8"));
  let changedPages = 0;
  for (const page of snapshot.pages) {
    const oldHead = page.headHtml;
    const oldBody = page.bodyHtml;
    page.headHtml = replaceFromMapping(page.headHtml, mapping.entries());
    page.bodyHtml = replaceFromMapping(page.bodyHtml, mapping.entries());
    if (page.headHtml !== oldHead || page.bodyHtml !== oldBody) {
      changedPages += 1;
    }
  }
  await writeFile(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);
  log(`Pages mises a jour: ${changedPages}/${snapshot.pages.length}`);

  const cssFiles = [];
  for (const root of SOURCE_DIRS) {
    if (!existsSync(root)) {
      continue;
    }
    const files = await walkFiles(root);
    cssFiles.push(...files.filter((filePath) => filePath.toLowerCase().endsWith(".css")));
  }

  let cssChanged = 0;
  for (const cssFile of cssFiles) {
    const original = await readFile(cssFile, "utf8");
    const updated = applyMappingToCss(original, cssFile, mapping);
    if (updated !== original) {
      cssChanged += 1;
      await writeFile(cssFile, updated);
    }
  }

  log(`CSS mis a jour: ${cssChanged}`);
  log(`Gain brut estime: ${(totalSavedBytes / (1024 * 1024)).toFixed(2)} MB`);

  // Remove converted files that never got mapped to avoid dead artifacts.
  const mappedTargets = new Set(mapping.values());
  for (const [sourceWebPath, targetWebPath] of mapping.entries()) {
    const sourceAbsolute = path.join(PUBLIC_DIR, sourceWebPath.replace(/^\/+/, ""));
    const targetAbsolute = path.join(PUBLIC_DIR, targetWebPath.replace(/^\/+/, ""));
    if (!mappedTargets.has(targetWebPath) || sourceAbsolute === targetAbsolute) {
      continue;
    }
    if (!existsSync(sourceAbsolute) || !existsSync(targetAbsolute)) {
      continue;
    }
  }
}

main().catch((error) => {
  console.error(`[images-webp] Erreur fatale: ${error.stack || error.message}`);
  process.exitCode = 1;
});
