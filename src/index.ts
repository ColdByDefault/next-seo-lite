/**
 * @Author ColdByDefault 2026
 * @MIT License
 */

// Types
export type {
  SEOConfig,
  SEOProps,
  PersonSchemaProps,
  ArticleSchemaProps,
  OrganizationSchemaProps,
  JsonLdProps,
} from "./types";

// Metadata helpers
export { createSEOConfig, defineSEO } from "./metadata";

// Schema.org structured data builders
export { personSchema, articleSchema, organizationSchema } from "./schemas";

// JSON-LD utilities & component
export { jsonLdScript, JsonLd } from "./jsonld";
