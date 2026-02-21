#!/usr/bin/env node
import { readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const SNAPSHOT_PATH = path.resolve("src/data/wp-snapshot.json");
const PUBLIC_PATH = path.resolve("public");
const TARGET_PREFIXES = ["/wp-content/", "/wp-includes/"];

function log(message) {
  console.log(`[clean-wp] ${message}`);
}

function decodeHtmlEntities(value) {
  return value.replaceAll("&#038;", "&").replaceAll("&amp;", "&");
}

function isLocalWpUrl(url) {
  return TARGET_PREFIXES.some((prefix) => url.startsWith(prefix));
}

function normalizeAssetUrl(raw) {
  if (!raw) {
    return raw;
  }

  let value = decodeHtmlEntities(raw.trim());

  if (value.startsWith("https://oliviers36.sg-host.com")) {
    value = value.slice("https://oliviers36.sg-host.com".length);
  } else if (value.startsWith("http://oliviers36.sg-host.com")) {
    value = value.slice("http://oliviers36.sg-host.com".length);
  } else if (value.startsWith("//oliviers36.sg-host.com")) {
    value = value.slice("//oliviers36.sg-host.com".length);
  }

  if (!value.startsWith("/")) {
    return value;
  }

  const [pathname] = value.split(/[?#]/);
  return pathname;
}

function sanitizeHead(headHtml) {
  let value = headHtml;

  // Remove WordPress/Woo feeds, oEmbed, XMLRPC, REST discovery links and generator tags.
  value = value.replace(
    /<link\b[^>]*(?:href=(["'])(?:(?!\1).)*(?:\/wp-json\/|oembed|\/feed\/|xmlrpc\.php)(?:(?!\1).)*\1|rel=(["'])(?:alternate|https:\/\/api\.w\.org\/|pingback|EditURI|wlwmanifest|shortlink)\2)[^>]*>\s*/gi,
    ""
  );
  value = value.replace(/<meta\b[^>]*name=(["'])generator\1[^>]*>\s*/gi, "");
  value = value.replace(/<meta\b[^>]*name=(["'])generator\1[^>]*\/>\s*/gi, "");

  // Remove plugin styles not needed on the Astro clone.
  value = value.replace(
    /<link\b[^>]*href=(["'])(?:(?!\1).)*\/wp-content\/plugins\/(?:woocommerce|woo-smart-compare|woo-smart-wishlist|contact-form-7)(?:(?!\1).)*\1[^>]*>\s*/gi,
    ""
  );
  value = value.replace(
    /<style\b[^>]*id=(["'])(?:(?!\1).)*(?:woocommerce|woosw|woosc|wpcf7|contact-form-7)(?:(?!\1).)*\1[^>]*>[\s\S]*?<\/style>\s*/gi,
    ""
  );
  value = value.replace(
    /<script\b[^>]*src=(["'])(?:(?!\1).)*\/wp-content\/plugins\/(?:woocommerce|woo-smart-compare|woo-smart-wishlist|contact-form-7)(?:(?!\1).)*\1[^>]*>\s*<\/script>\s*/gi,
    ""
  );
  value = value.replace(
    /<script\b[^>]*id=(["'])(?:(?!\1).)*(?:woocommerce|wc-|woosw|woosc|wpcf7|contact-form-7)(?:(?!\1).)*\1[^>]*>[\s\S]*?<\/script>\s*/gi,
    ""
  );
  value = value.replace(
    /<script\b[^>]*>[\s\S]*?(?:woosw_vars|woosc_vars|wc_order_attribution|wc_cart_fragments_params|wc_add_to_cart_params|woocommerce_params|wpcf7|contact-form-7|\/wp-admin\/admin-ajax\.php|wc-ajax)[\s\S]*?<\/script>\s*/gi,
    ""
  );

  // Remove WordPress emoji runtime.
  value = value.replace(
    /<script\b[^>]*(?:src=(["'])(?:(?!\1).)*(?:wp-emoji-release|wp-emoji-loader)(?:(?!\1).)*\1|id=(["'])(?:(?!\2).)*emoji(?:(?!\2).)*\2)[^>]*>[\s\S]*?<\/script>\s*/gi,
    ""
  );
  value = value.replace(/<style\b[^>]*id=(["'])wp-emoji-styles-inline-css\1[^>]*>[\s\S]*?<\/style>\s*/gi, "");
  value = value.replace(/<script\b[^>]*id=(["'])wp-emoji-settings\1[^>]*>[\s\S]*?<\/script>\s*/gi, "");
  value = value.replace(/<script\b[^>]*>[\s\S]*?_wpemojiSettings[\s\S]*?<\/script>\s*/gi, "");
  value = value.replace(/<script\b[^>]*type=(["'])module\1[^>]*>[\s\S]*?wp-emoji-loader[\s\S]*?<\/script>\s*/gi, "");

  // Normalize local asset URLs in href/src.
  value = value.replace(/(\b(?:href|src)=["'])([^"']+)(["'])/gi, (full, a, b, c) => {
    const normalized = normalizeAssetUrl(b);
    return `${a}${normalized}${c}`;
  });

  return value.trim();
}

function sanitizeBody(bodyHtml) {
  let value = bodyHtml;

  // Remove comment-reply script (not used on static pages without WP comments backend).
  value = value.replace(
    /<script\b[^>]*src=(["'])(?:(?!\1).)*comment-reply\.min\.js(?:(?!\1).)*\1[^>]*>\s*<\/script>\s*/gi,
    ""
  );
  value = value.replace(
    /<script\b[^>]*src=(["'])(?:(?!\1).)*\/wp-content\/plugins\/(?:woocommerce|woo-smart-compare|woo-smart-wishlist|contact-form-7)(?:(?!\1).)*\1[^>]*>\s*<\/script>\s*/gi,
    ""
  );
  value = value.replace(
    /<script\b[^>]*(?:src=(["'])(?:(?!\1).)*(?:wp-emoji-release|wp-emoji-loader)(?:(?!\1).)*\1|id=(["'])(?:(?!\2).)*emoji(?:(?!\2).)*\2)[^>]*>[\s\S]*?<\/script>\s*/gi,
    ""
  );
  value = value.replace(
    /<script\b[^>]*id=(["'])(?:(?!\1).)*(?:woocommerce|wc-|woosw|woosc|wpcf7|contact-form-7)(?:(?!\1).)*\1[^>]*>[\s\S]*?<\/script>\s*/gi,
    ""
  );
  value = value.replace(
    /<script\b[^>]*>[\s\S]*?(?:woosw_vars|woosc_vars|wc_order_attribution|wc_cart_fragments_params|wc_add_to_cart_params|woocommerce_params|wpcf7|contact-form-7|\/wp-admin\/admin-ajax\.php|wc-ajax)[\s\S]*?<\/script>\s*/gi,
    ""
  );
  value = value.replace(/<script\b[^>]*id=(["'])wp-emoji-settings\1[^>]*>[\s\S]*?<\/script>\s*/gi, "");
  value = value.replace(/<script\b[^>]*type=(["'])module\1[^>]*>[\s\S]*?wp-emoji-loader[\s\S]*?<\/script>\s*/gi, "");
  value = value.replace(/<script\b[^>]*>[\s\S]*?_wpemojiSettings[\s\S]*?<\/script>\s*/gi, "");

  // Normalize local asset URLs in common attributes.
  value = value.replace(
    /(\b(?:href|src|srcset|poster|data-src|data-bg)=["'])([^"']+)(["'])/gi,
    (full, a, b, c) => {
      if (a.toLowerCase().includes("srcset")) {
        const cleaned = b
          .split(",")
          .map((part) => part.trim())
          .map((entry) => {
            if (!entry) {
              return entry;
            }
            const [url, descriptor] = entry.split(/\s+/, 2);
            const normalized = normalizeAssetUrl(url);
            return descriptor ? `${normalized} ${descriptor}` : normalized;
          })
          .join(", ");
        return `${a}${cleaned}${c}`;
      }

      return `${a}${normalizeAssetUrl(b)}${c}`;
    }
  );

  return value.trim();
}

function collectHtmlAssetRefs(html, assetSet) {
  const attrRegex = /\b(?:href|src|poster|data-src|data-bg)=["']([^"']+)["']/gi;
  for (const match of html.matchAll(attrRegex)) {
    const normalized = normalizeAssetUrl(match[1]);
    if (isLocalWpUrl(normalized)) {
      assetSet.add(normalized);
    }
  }

  const srcsetRegex = /\bsrcset=["']([^"']+)["']/gi;
  for (const match of html.matchAll(srcsetRegex)) {
    const entries = match[1].split(",");
    for (const entry of entries) {
      const [url] = entry.trim().split(/\s+/, 1);
      const normalized = normalizeAssetUrl(url);
      if (isLocalWpUrl(normalized)) {
        assetSet.add(normalized);
      }
    }
  }
}

function resolveRelativeAsset(baseAssetPath, candidate) {
  const raw = candidate.trim().replace(/^['"]|['"]$/g, "");
  if (!raw || raw.startsWith("data:") || raw.startsWith("http:") || raw.startsWith("https:") || raw.startsWith("//")) {
    return null;
  }

  const [withoutQuery] = raw.split(/[?#]/);
  if (!withoutQuery) {
    return null;
  }

  if (withoutQuery.startsWith("/")) {
    return withoutQuery;
  }

  const baseDir = path.posix.dirname(baseAssetPath);
  return path.posix.normalize(path.posix.join(baseDir, withoutQuery));
}

async function expandCssDependencies(initialAssetSet) {
  const visited = new Set();
  const queue = [...initialAssetSet].filter((asset) => asset.endsWith(".css"));

  while (queue.length > 0) {
    const cssAssetPath = queue.pop();
    if (visited.has(cssAssetPath)) {
      continue;
    }
    visited.add(cssAssetPath);

    const diskPath = path.join(PUBLIC_PATH, cssAssetPath.replace(/^\/+/, ""));

    let content;
    try {
      content = await readFile(diskPath, "utf8");
    } catch {
      continue;
    }

    const urlRegex = /url\(([^)]+)\)/gi;
    for (const match of content.matchAll(urlRegex)) {
      const candidate = resolveRelativeAsset(cssAssetPath, decodeHtmlEntities(match[1]));
      if (candidate && isLocalWpUrl(candidate) && !initialAssetSet.has(candidate)) {
        initialAssetSet.add(candidate);
        if (candidate.endsWith(".css")) {
          queue.push(candidate);
        }
      }
    }

    const importRegex = /@import\s+(?:url\()?['"]?([^'")\s]+)['"]?\)?/gi;
    for (const match of content.matchAll(importRegex)) {
      const candidate = resolveRelativeAsset(cssAssetPath, decodeHtmlEntities(match[1]));
      if (candidate && isLocalWpUrl(candidate) && !initialAssetSet.has(candidate)) {
        initialAssetSet.add(candidate);
        if (candidate.endsWith(".css")) {
          queue.push(candidate);
        }
      }
    }
  }
}

async function walkFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

async function removeEmptyDirs(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      await removeEmptyDirs(path.join(dir, entry.name));
    }
  }

  const finalEntries = await readdir(dir, { withFileTypes: true });
  if (finalEntries.length === 0) {
    await rm(dir, { recursive: false, force: true });
  }
}

async function pruneAssets(assetSet) {
  let removedFiles = 0;
  let removedBytes = 0;

  for (const prefix of ["wp-content", "wp-includes"]) {
    const root = path.join(PUBLIC_PATH, prefix);
    let files = [];
    try {
      files = await walkFiles(root);
    } catch {
      continue;
    }

    for (const filePath of files) {
      const relative = `/${path.relative(PUBLIC_PATH, filePath).split(path.sep).join("/")}`;
      if (!assetSet.has(relative)) {
        const stats = await stat(filePath);
        removedBytes += stats.size;
        removedFiles += 1;
        await rm(filePath, { force: true });
      }
    }

    await removeEmptyDirs(root).catch(() => {});
  }

  return { removedFiles, removedBytes };
}

async function main() {
  const raw = await readFile(SNAPSHOT_PATH, "utf8");
  const snapshot = JSON.parse(raw);

  let changedPages = 0;
  for (const page of snapshot.pages) {
    const oldHead = page.headHtml;
    const oldBody = page.bodyHtml;
    page.headHtml = sanitizeHead(page.headHtml);
    page.bodyHtml = sanitizeBody(page.bodyHtml);
    if (oldHead !== page.headHtml || oldBody !== page.bodyHtml) {
      changedPages += 1;
    }
  }

  const assetSet = new Set();
  for (const page of snapshot.pages) {
    collectHtmlAssetRefs(page.headHtml, assetSet);
    collectHtmlAssetRefs(page.bodyHtml, assetSet);
  }

  const beforeCssExpansion = assetSet.size;
  await expandCssDependencies(assetSet);

  const { removedFiles, removedBytes } = await pruneAssets(assetSet);

  await writeFile(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);

  log(`Pages nettoyees: ${changedPages}/${snapshot.pages.length}`);
  log(`Assets references (HTML): ${beforeCssExpansion}`);
  log(`Assets references (+CSS deps): ${assetSet.size}`);
  log(`Assets supprimes: ${removedFiles} (${(removedBytes / (1024 * 1024)).toFixed(2)} MB)`);
}

main().catch((error) => {
  console.error(`[clean-wp] Erreur fatale: ${error.stack || error.message}`);
  process.exitCode = 1;
});
