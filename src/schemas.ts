/**
 * @Author ColdByDefault 2026
 * @MIT License
 */

import type {
  PersonSchemaProps,
  ArticleSchemaProps,
  OrganizationSchemaProps,
} from "./types";

// ---------------------------------------------------------------------------
// Structured Data Helpers (JSON-LD)
// ---------------------------------------------------------------------------

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
