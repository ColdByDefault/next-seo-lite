import type { Metadata } from "next";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Global defaults applied to every page when you don't override them.
 * Pass this once at the root layout level via `createSEOConfig`.
 */
export interface SEOConfig {
  /** Your brand / product name, appended to every page title. */
  siteName?: string;
  /** Absolute base URL used for canonical links, e.g. "https://example.com". */
  baseUrl?: string;
  /** Fallback OG/Twitter image URL used when a page omits its own image. */
  defaultImage?: string;
}

/**
 * Per-page SEO props passed to `defineSEO`.
 */
export interface SEOProps {
  /** Page-level title (without the site name suffix). */
  title: string;
  /** Short description shown in search results and social previews. */
  description: string;
  /**
   * Absolute or relative path for this page's OG/Twitter image.
   * Falls back to `SEOConfig.defaultImage` when omitted.
   */
  image?: string;
  /**
   * Slug / path appended to `SEOConfig.baseUrl` to build the canonical URL,
   * e.g. "/about". Ignored when no `baseUrl` is configured.
   */
  path?: string;
  /**
   * Override the global `siteName` for this specific page.
   * Set to `""` (empty string) to suppress the suffix entirely.
   */
  siteName?: string;
  /**
   * Override the global `baseUrl` for this specific page.
   */
  baseUrl?: string;
  /**
   * Override the global `defaultImage` for this page.
   */
  defaultImage?: string;
}

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
  const image = props.image ?? props.defaultImage ?? config.defaultImage;

  // ---- Title --------------------------------------------------------------
  const fullTitle =
    siteName !== undefined && siteName !== ""
      ? `${props.title} | ${siteName}`
      : props.title;

  // ---- Canonical URL ------------------------------------------------------
  let canonical: string | undefined;
  if (baseUrl) {
    const base = baseUrl.replace(/\/$/, "");
    const normalized = props.path ? props.path.replace(/^\//, "") : "";
    const slug = normalized ? `/${normalized}` : "";
    canonical = `${base}${slug}`;
  }

  // ---- OG images ----------------------------------------------------------
  const ogImages: { url: string }[] = image ? [{ url: image }] : [];

  // ---- Twitter images -----------------------------------------------------
  const twitterImages: string[] = image ? [image] : [];

  // ---- Assemble Metadata --------------------------------------------------
  const metadata: Metadata = {
    title: fullTitle,
    description: props.description,
    openGraph: {
      title: fullTitle,
      description: props.description,
      ...(ogImages.length > 0 && { images: ogImages }),
      type: "website",
      ...(siteName && { siteName }),
      ...(canonical && { url: canonical }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: props.description,
      ...(twitterImages.length > 0 && { images: twitterImages }),
    },
    ...(canonical && {
      alternates: {
        canonical,
      },
    }),
  };

  return metadata;
}
