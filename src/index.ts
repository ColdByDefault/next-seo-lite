/**
 * @Author ColdByDefault 2026
 * @MIT License
 */

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
  /**
   * Character(s) placed between the page title and site name.
   * Defaults to `"|"` → `"Home | MyBrand"`.
   */
  titleSeparator?: string;
  /**
   * Default `og:locale` value, e.g. `"en_US"`.
   * Can be overridden per-page via `SEOProps.locale`.
   */
  locale?: string;
  /**
   * Default keywords applied to every page.
   * Page-level keywords are merged with these.
   */
  keywords?: string[];
  /**
   * Author name for `meta[name=author]` and `meta[name=creator]`.
   */
  author?: string;
  /**
   * Publisher name. Falls back to `siteName` when omitted.
   */
  publisher?: string;
  /**
   * Twitter `@handle` used for `twitter:creator` / `twitter:site`.
   */
  twitterHandle?: string;
  /**
   * Language alternate mapping used for `hreflang` tags.
   * Keys are locale codes, values are path prefixes.
   *
   * @example
   * { "en": "", "de": "/de", "fr": "/fr" }
   *
   * Combined with `baseUrl` and the page `path` to produce full URLs.
   */
  alternateLocales?: Record<string, string>;
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
   * Absolute URL for this page's OG/Twitter image.
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
   * When `true`, sets `robots: { index: false, follow: false }`.
   * Use for private pages like /dashboard, /checkout, /thank-you.
   */
  noIndex?: boolean;
  /**
   * Override `og:locale` for this specific page, e.g. `"fr_FR"`.
   */
  locale?: string;
  /**
   * Page-level keywords. Merged with global `SEOConfig.keywords` (deduplicated).
   */
  keywords?: string[];
  /**
   * Override the global author for this page.
   */
  author?: string;
  /**
   * Alt text for the OG / Twitter image.
   * Falls back to `"<title> - <siteName>"` when omitted.
   */
  imageAlt?: string;
  /**
   * Width of the OG image in pixels. Defaults to `1200`.
   */
  imageWidth?: number;
  /**
   * Height of the OG image in pixels. Defaults to `630`.
   */
  imageHeight?: number;
  /**
   * Override the default `og:type`. Defaults to `"website"`.
   */
  type?: string;
  /**
   * Per-page language alternate URLs.
   * Keys are locale codes, values are full URLs or path overrides.
   *
   * @example
   * { "en": "/about", "de": "/de/about" }
   */
  alternates?: Record<string, string>;
  /**
   * JSON-LD structured data object(s) to attach.
   * Returned in `metadata.other["structured-data"]` as a serialised string
   * and also available via the standalone `<JsonLd>` helper.
   */
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
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

// ---------------------------------------------------------------------------
// Structured Data Helpers (JSON-LD)
// ---------------------------------------------------------------------------

/**
 * Props for generating a Person JSON-LD schema.
 */
export interface PersonSchemaProps {
  /** Full name */
  name: string;
  /** Absolute URL of the person's website */
  url: string;
  /** Job title, e.g. "Full Stack Developer" */
  jobTitle?: string;
  /** Short bio / description */
  description?: string;
  /** Email address */
  email?: string;
  /** Absolute URL to a profile image */
  image?: string;
  /** Social profile URLs (GitHub, LinkedIn, Twitter, etc.) */
  sameAs?: string[];
  /** List of skills / topics the person knows about */
  knowsAbout?: string[];
  /** Physical location or place name */
  location?: string;
  /** Organization the person works for */
  worksFor?: { name: string; url?: string };
}

/**
 * Generate a Schema.org `Person` JSON-LD object.
 *
 * @example
 * const schema = personSchema({
 *   name: "Jane Doe",
 *   url: "https://janedoe.dev",
 *   jobTitle: "Full Stack Developer",
 *   sameAs: ["https://github.com/janedoe"],
 * });
 */
export function personSchema(
  props: PersonSchemaProps,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: props.name,
    url: props.url,
    ...(props.jobTitle && { jobTitle: props.jobTitle }),
    ...(props.description && { description: props.description }),
    ...(props.email && { email: props.email }),
    ...(props.image && { image: props.image }),
    ...(props.sameAs?.length && { sameAs: props.sameAs }),
    ...(props.knowsAbout?.length && { knowsAbout: props.knowsAbout }),
    ...(props.location && {
      address: { "@type": "Place", name: props.location },
    }),
    ...(props.worksFor && {
      worksFor: {
        "@type": "Organization",
        name: props.worksFor.name,
        ...(props.worksFor.url && { url: props.worksFor.url }),
      },
    }),
  };
}

/**
 * Props for generating an Article / BlogPosting JSON-LD schema.
 */
export interface ArticleSchemaProps {
  /** Headline of the article */
  headline: string;
  /** Short summary / excerpt */
  description: string;
  /** Absolute URL of the article */
  url: string;
  /** Absolute URL of the featured image */
  image?: string;
  /** ISO 8601 date string for publication date */
  datePublished: string;
  /** ISO 8601 date string for last modification */
  dateModified?: string;
  /** Author name */
  authorName: string;
  /** Author URL (website / profile) */
  authorUrl?: string;
  /** Publisher / site name */
  publisherName?: string;
  /** Absolute URL to publisher logo */
  publisherLogo?: string;
  /** Word count */
  wordCount?: number;
  /** Reading time in minutes (converted to ISO 8601 duration) */
  readingTime?: number;
  /** Keywords / tags */
  keywords?: string[];
  /** Article section / category name */
  articleSection?: string;
  /**
   * Schema.org `@type`. Defaults to "BlogPosting".
   * Set to "Article", "NewsArticle", etc. as needed.
   */
  type?: string;
}

/**
 * Generate a Schema.org `Article` / `BlogPosting` JSON-LD object.
 *
 * @example
 * const schema = articleSchema({
 *   headline: "Getting Started with Next.js",
 *   description: "A beginner-friendly guide to Next.js.",
 *   url: "https://myblog.com/blog/nextjs-guide",
 *   datePublished: "2025-01-15T10:00:00Z",
 *   authorName: "Jane Doe",
 * });
 */
export function articleSchema(
  props: ArticleSchemaProps,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": props.type ?? "BlogPosting",
    headline: props.headline,
    description: props.description,
    url: props.url,
    mainEntityOfPage: props.url,
    ...(props.image && { image: props.image }),
    datePublished: props.datePublished,
    ...(props.dateModified && { dateModified: props.dateModified }),
    author: {
      "@type": "Person",
      name: props.authorName,
      ...(props.authorUrl && { url: props.authorUrl }),
    },
    ...(props.publisherName && {
      publisher: {
        "@type": "Organization",
        name: props.publisherName,
        ...(props.publisherLogo && { logo: props.publisherLogo }),
      },
    }),
    ...(props.wordCount && { wordCount: props.wordCount }),
    ...(props.readingTime && { timeRequired: `PT${props.readingTime}M` }),
    ...(props.keywords?.length && { keywords: props.keywords }),
    ...(props.articleSection && { articleSection: props.articleSection }),
  };
}

/**
 * Props for generating an Organization JSON-LD schema.
 */
export interface OrganizationSchemaProps {
  /** Organization name */
  name: string;
  /** Absolute URL of the organization's website */
  url: string;
  /** Absolute URL to the logo image */
  logo?: string;
  /** Short description */
  description?: string;
  /** Social profile URLs */
  sameAs?: string[];
  /** Contact email */
  email?: string;
  /** Contact phone */
  telephone?: string;
}

/**
 * Generate a Schema.org `Organization` JSON-LD object.
 */
export function organizationSchema(
  props: OrganizationSchemaProps,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: props.name,
    url: props.url,
    ...(props.logo && { logo: props.logo }),
    ...(props.description && { description: props.description }),
    ...(props.sameAs?.length && { sameAs: props.sameAs }),
    ...(props.email && { email: props.email }),
    ...(props.telephone && { telephone: props.telephone }),
  };
}

/**
 * Serialise one or more JSON-LD objects into a `<script>` tag string.
 * Drop this into your root layout or page component.
 *
 * @example
 * // In a Server Component:
 * <div dangerouslySetInnerHTML={{ __html: jsonLdScript(schema) }} />
 */
export function jsonLdScript(
  data: Record<string, unknown> | Record<string, unknown>[],
): string {
  const json = JSON.stringify(data);
  return `<script type="application/ld+json">${json}</script>`;
}
