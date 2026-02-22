/**
 * @Author ColdByDefault 2026
 * @MIT License
 */

import type { Metadata } from "next";
import type { SEOConfig, SEOProps } from "./types";

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a `defineSEO` function pre-loaded with your global defaults.
 *
 * @example
 * // lib/seo.ts
 * import { createSEOConfig } from 'next-seo-lite';
 *
 * export const defineSEO = createSEOConfig({
 *   siteName: 'MyBrand',
 *   baseUrl: 'https://mybrand.com',
 *   defaultImage: 'https://mybrand.com/og-default.png',
 * });
 */
export function createSEOConfig(config: SEOConfig = {}) {
  return function defineSEO(props: SEOProps): Metadata {
    return buildMetadata(props, config);
  };
}

// ---------------------------------------------------------------------------
// Standalone helper (zero-config)
// ---------------------------------------------------------------------------

/**
 * One-shot helper when you don't need global defaults.
 *
 * @example
 * // app/page.tsx
 * import { defineSEO } from 'next-seo-lite';
 *
 * export const metadata = defineSEO({
 *   title: 'Home',
 *   description: 'Welcome to my site.',
 *   siteName: 'MyBrand',
 * });
 */
export function defineSEO(props: SEOProps): Metadata {
  return buildMetadata(props, {});
}

// ---------------------------------------------------------------------------
// Core builder
// ---------------------------------------------------------------------------

function buildMetadata(props: SEOProps, config: SEOConfig): Metadata {
  // ---- Resolve values (page-level wins over global config) ----------------
  const siteName =
    props.siteName !== undefined ? props.siteName : config.siteName;
  const baseUrl = props.baseUrl ?? config.baseUrl;
  const image = props.image ?? config.defaultImage;
  const separator = config.titleSeparator ?? "|";
  const locale = props.locale ?? config.locale;
  const author = props.author ?? config.author;
  const publisher = config.publisher ?? siteName;

  // ---- Keywords (merge global + page-level, deduplicate) ------------------
  const keywords = [...(config.keywords ?? []), ...(props.keywords ?? [])];
  const uniqueKeywords = [...new Set(keywords)];

  // ---- Title --------------------------------------------------------------
  const fullTitle =
    siteName !== undefined && siteName !== ""
      ? `${props.title} ${separator} ${siteName}`
      : props.title;

  // ---- Canonical URL ------------------------------------------------------
  let canonical: string | undefined;
  let normalizedBase: string | undefined;
  if (baseUrl) {
    normalizedBase = baseUrl.replace(/\/$/, "");
    const normalized = props.path ? props.path.replace(/^\//, "") : "";
    const slug = normalized ? `/${normalized}` : "";
    canonical = `${normalizedBase}${slug}`;
  }

  // ---- OG images (with width / height / alt) ------------------------------
  const imageAlt =
    props.imageAlt ?? (siteName ? `${props.title} - ${siteName}` : props.title);
  const imageWidth = props.imageWidth ?? 1200;
  const imageHeight = props.imageHeight ?? 630;
  const ogImages: {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  }[] = image
    ? [{ url: image, width: imageWidth, height: imageHeight, alt: imageAlt }]
    : [];

  // ---- Twitter images + card type -----------------------------------------
  const twitterCard = image ? "summary_large_image" : "summary";
  const twitterImages: string[] = image ? [image] : [];

  // ---- Alternates (hreflang) ----------------------------------------------
  const pageAlternates = props.alternates;
  const configAlternates = config.alternateLocales;
  let languages: Record<string, string> | undefined;

  if (pageAlternates) {
    // Page-level alternates: resolve against baseUrl if relative
    languages = {};
    for (const [loc, urlOrPath] of Object.entries(pageAlternates)) {
      languages[loc] = urlOrPath.startsWith("http")
        ? urlOrPath
        : normalizedBase
          ? `${normalizedBase}${urlOrPath}`
          : urlOrPath;
    }
  } else if (configAlternates && normalizedBase && props.path) {
    // Build from config alternateLocales + page path
    languages = {};
    for (const [loc, prefix] of Object.entries(configAlternates)) {
      const pagePath = props.path.replace(/^\//, "");
      languages[loc] =
        `${normalizedBase}${prefix}${pagePath ? `/${pagePath}` : ""}`;
    }
  }

  // ---- Robots (comprehensive for 100% Lighthouse) ------------------------
  const robots = props.noIndex
    ? { index: false as const, follow: false as const }
    : {
        index: true as const,
        follow: true as const,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large" as const,
          "max-snippet": -1,
        },
      };

  // ---- OG type ------------------------------------------------------------
  const ogType = (props.type ?? "website") as "website" | "article";

  // ---- Assemble Metadata --------------------------------------------------
  const metadata: Metadata = {
    title: fullTitle,
    description: props.description,
    ...(uniqueKeywords.length > 0 && { keywords: uniqueKeywords }),
    ...(author && {
      authors: [{ name: author }],
      creator: author,
    }),
    ...(publisher && { publisher }),
    robots,
    ...(normalizedBase && { metadataBase: new URL(normalizedBase) }),
    openGraph: {
      title: fullTitle,
      description: props.description,
      ...(ogImages.length > 0 && { images: ogImages }),
      type: ogType,
      ...(siteName && { siteName }),
      ...(canonical && { url: canonical }),
      ...(locale && { locale }),
    },
    twitter: {
      card: twitterCard,
      title: fullTitle,
      description: props.description,
      ...(twitterImages.length > 0 && { images: twitterImages }),
      ...(config.twitterHandle && { creator: config.twitterHandle }),
      ...(config.twitterHandle && { site: config.twitterHandle }),
    },
    alternates: {
      ...(canonical && { canonical }),
      ...(languages && { languages }),
    },
  };

  // Clean up empty alternates
  if (
    !metadata.alternates?.canonical &&
    !(metadata.alternates as Record<string, unknown>)?.languages
  ) {
    delete metadata.alternates;
  }

  return metadata;
}
