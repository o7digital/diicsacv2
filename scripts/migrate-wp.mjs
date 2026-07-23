#!/usr/bin/env node
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const SITE_ORIGIN = (process.env.WP_ORIGIN ?? "https://oliviers36.sg-host.com").replace(/\/+$/, "");
const SITE_HOST = new URL(SITE_ORIGIN).host;
const OUTPUT_FILE = path.resolve("src/data/wp-snapshot.json");
const PUBLIC_DIR = path.resolve("public");
const USER_AGENT = "Mozilla/5.0 (WP-to-Astro Migrator)";
const CONCURRENCY = Number(process.env.WP_CONCURRENCY ?? 8);

const ASSET_EXTENSIONS = /\.(?:css|js|mjs|map|png|jpe?g|gif|webp|svg|avif|ico|woff2?|ttf|eot|otf|mp4|webm|m4v|mp3|ogg|wav|json|pdf|txt|xml)(?:$|\?)/i;

function log(message) {
  console.log(`[migrate-wp] ${message}`);
}

async function fetchWithRetry(url, responseType = "text", retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        headers: {
          accept: "*/*",
          "user-agent": USER_AGENT
        }
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      if (responseType === "json") {
        return { data: await response.json(), response };
      }

      if (responseType === "buffer") {
        return { data: Buffer.from(await response.arrayBuffer()), response };
      }

      return { data: await response.text(), response };
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }

  throw new Error(`Unreachable fetchWithRetry for ${url}`);
}

function decodeEntities(value) {
  return value
    .replaceAll("&#038;", "&")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#039;", "'");
}

function extractLocs(xml) {
  const locs = [];
  const matches = xml.matchAll(/<loc>([^<]+)<\/loc>/gi);
  for (const match of matches) {
    locs.push(decodeEntities(match[1].trim()));
  }
  return locs;
}

function normalizePathname(pathname) {
  let normalized = pathname || "/";
  normalized = normalized.replace(/\/{2,}/g, "/");
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }
  if (normalized !== "/" && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

function isHtmlRoute(urlValue) {
  const url = new URL(urlValue);
  const pathname = url.pathname.toLowerCase();
  if (pathname.endsWith("/feed") || pathname.includes("/feed/")) {
    return false;
  }
  const extension = path.extname(pathname);
  return !extension || extension === ".php";
}

function parseBodyAttributes(raw) {
  const attributes = {};
  const attrRegex = /([:@A-Za-z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  for (const match of raw.matchAll(attrRegex)) {
    const key = match[1];
    const value = decodeEntities(match[2] ?? match[3] ?? match[4] ?? "");
    attributes[key] = value;
  }
  return attributes;
}

function rewriteSiteUrls(markup) {
  const escapedHost = SITE_HOST.replaceAll(".", "\\.");
  return markup
    .replaceAll(`https://${SITE_HOST}`, "")
    .replaceAll(`http://${SITE_HOST}`, "")
    .replaceAll(`//${SITE_HOST}`, "")
    .replace(new RegExp(`https?:\\\\/\\\\/${escapedHost}`, "gi"), "")
    .replaceAll("&amp;", "&")
    .replaceAll("&#038;", "&");
}

function collectAssetUrls(markup) {
  const unescaped = markup.replace(/\\\//g, "/");
  const regex = new RegExp(`(?:https?:\\/\\/|\\/\\/)${SITE_HOST.replaceAll(".", "\\.")}\\/[^"'<>\\s)]+`, "gi");
  const urls = new Set();

  for (const match of unescaped.matchAll(regex)) {
    let value = decodeEntities(match[0]).replace(/[),]+$/g, "");
    if (value.startsWith("//")) {
      value = `https:${value}`;
    }

    try {
      const parsed = new URL(value);
      if (parsed.host !== SITE_HOST) {
        continue;
      }
      if (!parsed.pathname || parsed.pathname.endsWith("/")) {
        continue;
      }
      const isKnownAsset = ASSET_EXTENSIONS.test(parsed.pathname) ||
        ASSET_EXTENSIONS.test(parsed.href) ||
        parsed.pathname.includes("/wp-content/") ||
        parsed.pathname.includes("/wp-includes/");
      if (!isKnownAsset) {
        continue;
      }
      urls.add(parsed.href);
    } catch {
      // Ignore malformed URLs.
    }
  }

  return urls;
}

async function collectSitemapUrls() {
  const rootSitemapUrl = `${SITE_ORIGIN}/wp-sitemap.xml`;
  const urls = new Set();

  try {
    const { data: indexXml } = await fetchWithRetry(rootSitemapUrl);
    const sitemapEntries = extractLocs(indexXml).filter((loc) => loc.endsWith(".xml"));

    for (const sitemapUrl of sitemapEntries) {
      try {
        const { data: xml } = await fetchWithRetry(sitemapUrl);
        const locs = extractLocs(xml);
        for (const loc of locs) {
          if (loc.startsWith(SITE_ORIGIN) && isHtmlRoute(loc)) {
            urls.add(loc);
          }
        }
      } catch (error) {
        log(`Sitemap ignoré (${sitemapUrl}): ${error.message}`);
      }
    }
  } catch (error) {
    log(`Sitemap indisponible: ${error.message}`);
  }

  return urls;
}

async function fetchCollection(endpoint) {
  const links = [];
  let pageNumber = 1;
  let totalPages = 1;

  do {
    const requestUrl = `${SITE_ORIGIN}/wp-json/wp/v2/${endpoint}?per_page=100&page=${pageNumber}&_fields=id,slug,link,type,status`;

    try {
      const { data, response } = await fetchWithRetry(requestUrl, "json");
      const parsedTotalPages = Number(response.headers.get("x-wp-totalpages") ?? "1");
      totalPages = Number.isFinite(parsedTotalPages) && parsedTotalPages > 0 ? parsedTotalPages : 1;

      for (const entry of data) {
        if (entry?.status === "publish" && entry?.link) {
          links.push(entry.link);
        }
      }

      pageNumber += 1;
    } catch (error) {
      log(`Endpoint ignoré (${endpoint}, page ${pageNumber}): ${error.message}`);
      break;
    }
  } while (pageNumber <= totalPages);

  return links;
}

async function collectRouteUrls() {
  const routeUrls = new Set([`${SITE_ORIGIN}/`]);

  for (const sitemapUrl of await collectSitemapUrls()) {
    routeUrls.add(sitemapUrl);
  }

  const collections = ["pages", "posts", "product"];
  for (const collection of collections) {
    for (const link of await fetchCollection(collection)) {
      if (link.startsWith(SITE_ORIGIN) && isHtmlRoute(link)) {
        routeUrls.add(link);
      }
    }
  }

  return [...routeUrls];
}

async function mapWithConcurrency(values, limit, mapper) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < values.length) {
      const currentIndex = index;
      index += 1;
      results[currentIndex] = await mapper(values[currentIndex], currentIndex);
    }
  }

  const workers = Array.from({ length: Math.max(1, limit) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function fetchPageSnapshot(url) {
  const { data: html, response } = await fetchWithRetry(url, "text");
  const contentType = (response.headers.get("content-type") ?? "").toLowerCase();
  if (contentType && !contentType.includes("text/html")) {
    throw new Error(`contenu non-HTML (${contentType})`);
  }
  const resolvedUrl = response.url || url;
  const resolved = new URL(resolvedUrl);

  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const bodyMatch = html.match(/<body([^>]*)>([\s\S]*?)<\/body>/i);
  const rawHead = headMatch?.[1] ?? "";
  const rawBody = bodyMatch ? bodyMatch[2] ?? "" : html;
  const bodyAttributes = bodyMatch ? parseBodyAttributes(bodyMatch[1] ?? "") : {};

  const titleMatch = rawHead.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

  const assets = new Set([
    ...collectAssetUrls(rawHead),
    ...collectAssetUrls(rawBody)
  ]);

  return {
    path: normalizePathname(resolved.pathname),
    sourceUrl: resolvedUrl,
    title: decodeEntities((titleMatch?.[1] ?? "").trim()),
    headHtml: rewriteSiteUrls(rawHead),
    bodyHtml: rewriteSiteUrls(rawBody),
    bodyAttributes,
    assets: [...assets]
  };
}

async function downloadAsset(assetUrl) {
  let parsed;
  try {
    parsed = new URL(assetUrl);
  } catch {
    return false;
  }

  if (parsed.host !== SITE_HOST) {
    return false;
  }

  const relativePath = parsed.pathname.replace(/^\/+/, "");
  if (!relativePath) {
    return false;
  }

  const outputPath = path.join(PUBLIC_DIR, relativePath);
  if (existsSync(outputPath)) {
    return true;
  }

  await mkdir(path.dirname(outputPath), { recursive: true });

  try {
    const { data } = await fetchWithRetry(parsed.href, "buffer");
    await writeFile(outputPath, data);
    return true;
  } catch (error) {
    log(`Asset non téléchargé (${parsed.href}): ${error.message}`);
    return false;
  }
}

async function main() {
  log(`Source: ${SITE_ORIGIN}`);
  const routeUrls = await collectRouteUrls();
  const filteredUrls = routeUrls
    .filter((value) => value.startsWith(SITE_ORIGIN))
    .filter((value) => isHtmlRoute(value))
    .sort();

  log(`Routes détectées: ${filteredUrls.length}`);

  const pageSnapshots = (await mapWithConcurrency(filteredUrls, CONCURRENCY, async (value, index) => {
    try {
      const snapshot = await fetchPageSnapshot(value);
      log(`Page ${index + 1}/${filteredUrls.length}: ${snapshot.path}`);
      return snapshot;
    } catch (error) {
      log(`Page ignorée (${value}): ${error.message}`);
      return null;
    }
  })).filter(Boolean);

  const dedupedPages = new Map();
  for (const page of pageSnapshots) {
    const existing = dedupedPages.get(page.path);
    if (!existing || page.bodyHtml.length > existing.bodyHtml.length) {
      dedupedPages.set(page.path, page);
    }
  }

  const pages = [...dedupedPages.values()].sort((a, b) => a.path.localeCompare(b.path));
  const assetSet = new Set();
  for (const page of pages) {
    for (const asset of page.assets) {
      assetSet.add(asset);
    }
    delete page.assets;
  }

  log(`Pages retenues: ${pages.length}`);
  log(`Assets détectés: ${assetSet.size}`);

  const assets = [...assetSet].sort();
  let downloaded = 0;

  await mapWithConcurrency(assets, CONCURRENCY, async (assetUrl) => {
    const ok = await downloadAsset(assetUrl);
    if (ok) {
      downloaded += 1;
    }
  });

  log(`Assets téléchargés: ${downloaded}`);

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  const payload = {
    generatedAt: new Date().toISOString(),
    sourceOrigin: SITE_ORIGIN,
    pageCount: pages.length,
    pages
  };

  await writeFile(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`);
  log(`Snapshot écrit: ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(`[migrate-wp] Erreur fatale: ${error.stack || error.message}`);
  process.exitCode = 1;
});
