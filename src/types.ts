/**
 * @Author ColdByDefault 2026
 * @MIT License
 */

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
 * Props for the `<JsonLd>` component.
 */
export interface JsonLdProps {
  /** One or more Schema.org JSON-LD objects to embed. */
  data: Record<string, unknown> | Record<string, unknown>[];
}
