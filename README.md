# next-seo-lite

> **Stop writing 50 lines of Meta tags. Do it in 5.**

A tiny, zero-runtime-dependency SEO helper for [Next.js](https://nextjs.org/) App Router.  
It turns simple props into the full `Metadata` object Next.js expects — including `openGraph`, `twitter`, canonical URLs, structured data (JSON-LD), and everything you need for a **100% Google Lighthouse SEO score**.

---

## Features

- **Title suffixing** — `"Home"` becomes `"Home | MyBrand"` automatically.
- **Configurable separator** — use `" – "` or `" · "` instead of the default `"|"` via `titleSeparator`.
- **OpenGraph** — fills `og:title`, `og:description`, `og:image` (with `width`, `height`, `alt`), `og:locale`, and `og:type` in one call.
- **Twitter Cards** — automatically uses `summary_large_image` when an image is provided, falls back to `summary` otherwise. Supports `twitter:creator` and `twitter:site`.
- **Canonical URLs** — combine a `baseUrl` with a page `path` and you're done.
- **hreflang alternates** — multi-language support via `alternateLocales` config or per-page `alternates`.
- **Default fallback image** — set once at the root, used everywhere you don't override it.
- **Keywords** — global + page-level keywords, merged and de-duplicated.
- **Author / Publisher** — sets `meta[name=author]`, `meta[name=creator]`, and `meta[name=publisher]`.
- **`metadataBase`** — automatically set from `baseUrl` for proper URL resolution.
- **Comprehensive robots** — public pages get full `googleBot` directives (`max-image-preview: large`, `max-snippet: -1`, `max-video-preview: -1`).
- **`noIndex` support** — mark private pages (`/dashboard`, `/checkout`) with a single flag.
- **Structured data (JSON-LD)** — built-in helpers for `Person`, `Article`/`BlogPosting`, and `Organization` schemas.
- **`<JsonLd>` component** — renders a `<script type="application/ld+json">` tag directly — no wrapper `<div>`, no `dangerouslySetInnerHTML` in your code, no hydration mismatches in Next.js.
- **Zero runtime dependencies** — only `next` and `react` as peer deps (for types / JSX).

---

## Installation

This package is published to **both npm and GitHub Packages** — use whichever fits your workflow.

### Option A — npm (recommended, zero friction)

```bash
npm install @coldbydefault/next-seo-lite@latest
# or
yarn add @coldbydefault/next-seo-lite@latest
# or
pnpm add @coldbydefault/next-seo-lite@latest
```

No auth, no `.npmrc` changes needed. ✅

---

### Option B — GitHub Packages

Useful if you're already inside a GitHub org/Actions workflow.

**1. Add to your project's `.npmrc`:**

```
@coldbydefault:registry=https://npm.pkg.github.com
```

**2. Authenticate once** with a GitHub [Personal Access Token](https://github.com/settings/tokens) that has `read:packages` scope:

```bash
npm login --registry=https://npm.pkg.github.com --scope=@coldbydefault
```

**3. Install** (same command as npm):

```bash
npm install @coldbydefault/next-seo-lite@latest
```

---

## Quick Start

### 1. One-liner per page (standalone)

```tsx
// app/about/page.tsx
import { defineSEO } from "@coldbydefault/next-seo-lite";
import type { Metadata } from "next";

export const metadata: Metadata = defineSEO({
  title: "About Us",
  description: "Learn more about our team.",
  siteName: "MyBrand",
  image: "https://mysite.com/about-og.png",
  baseUrl: "https://mysite.com",
  path: "/about",
  keywords: ["about", "team", "company"],
  author: "Jane Doe",
});
```

---

### 2. Global defaults with `createSEOConfig` (recommended)

Define your globals once, then call the returned function on every page.

```ts
// lib/seo.ts
import { createSEOConfig } from "@coldbydefault/next-seo-lite";

export const defineSEO = createSEOConfig({
  siteName: "MyBrand",
  baseUrl: "https://mysite.com",
  defaultImage: "https://mysite.com/og-default.png",
  keywords: ["MyBrand", "web development"],
  author: "Jane Doe",
  publisher: "MyBrand Inc.",
  twitterHandle: "@mybrand",
  locale: "en_US",
  alternateLocales: {
    en: "",
    de: "/de",
  },
});
```

```tsx
// app/layout.tsx
import { defineSEO } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = defineSEO({
  title: "Home",
  description: "Welcome to MyBrand.",
  path: "/",
});
```

```tsx
// app/blog/[slug]/page.tsx
import { defineSEO } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  return defineSEO({
    title: post.title,
    description: post.summary,
    image: post.coverImage,
    path: `/blog/${params.slug}`,
    keywords: post.tags,
    type: "article",
  });
}
```

---

### 3. Structured Data (JSON-LD)

Use the built-in schema helpers and the `<JsonLd>` component to embed valid JSON-LD for Google Rich Results — no wrapper `<div>`, no `dangerouslySetInnerHTML` in your code, and no hydration mismatches in Next.js.

```tsx
// app/layout.tsx
import { personSchema, JsonLd } from "@coldbydefault/next-seo-lite";

const schema = personSchema({
  name: "Jane Doe",
  url: "https://janedoe.dev",
  jobTitle: "Full Stack Developer",
  description: "Building modern web applications.",
  email: "jane@example.com",
  sameAs: ["https://github.com/janedoe", "https://linkedin.com/in/janedoe"],
  knowsAbout: ["React", "Next.js", "TypeScript"],
  location: "Berlin, Germany",
  worksFor: { name: "Acme Corp", url: "https://acme.com" },
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <JsonLd data={schema} />
        {children}
      </body>
    </html>
  );
}
```

```tsx
// app/blog/[slug]/page.tsx
import { articleSchema, JsonLd } from "@coldbydefault/next-seo-lite";

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);

  const schema = articleSchema({
    headline: post.title,
    description: post.excerpt,
    url: `https://mysite.com/blog/${post.slug}`,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    authorName: "Jane Doe",
    authorUrl: "https://janedoe.dev",
    publisherName: "MyBrand",
    publisherLogo: "https://mysite.com/logo.png",
    wordCount: post.wordCount,
    readingTime: post.readingTime,
    keywords: post.tags,
    articleSection: post.category,
  });

  return (
    <>
      <JsonLd data={schema} />
      <article>{/* ... */}</article>
    </>
  );
}
```

> **Migrating from `jsonLdScript()`?** The old string-based helper still works but is deprecated.
> Replace `<div dangerouslySetInnerHTML={{ __html: jsonLdScript(data) }} />` with `<JsonLd data={data} />`.

````

---

## API Reference

### `defineSEO(props: SEOProps): Metadata`

Standalone helper — no global config needed.

### `createSEOConfig(config: SEOConfig): (props: SEOProps) => Metadata`

Returns a `defineSEO` function pre-loaded with your global defaults.
Page-level props always win over the global config.

---

### `SEOConfig`

| Prop               | Type                     | Description                                                                                    |
| ------------------ | ------------------------ | ---------------------------------------------------------------------------------------------- |
| `siteName`         | `string`                 | Appended to every title: `"Page \| SiteName"`.                                                 |
| `baseUrl`          | `string`                 | Absolute base URL for canonical links, e.g. `"https://example.com"`. Also sets `metadataBase`. |
| `defaultImage`     | `string`                 | Fallback OG / Twitter image URL.                                                               |
| `titleSeparator`   | `string`                 | Separator between title and site name. Defaults to `"\|"`.                                     |
| `locale`           | `string`                 | Default `og:locale`, e.g. `"en_US"`.                                                           |
| `keywords`         | `string[]`               | Global keywords merged into every page.                                                        |
| `author`           | `string`                 | Author name for `meta[name=author]` and `meta[name=creator]`.                                  |
| `publisher`        | `string`                 | Publisher name. Falls back to `siteName`.                                                      |
| `twitterHandle`    | `string`                 | `@handle` for `twitter:creator` and `twitter:site`.                                            |
| `alternateLocales` | `Record<string, string>` | Locale → path prefix map for hreflang (`{ en: "", de: "/de" }`).                               |

---

### `SEOProps`

| Prop             | Type                     | Required | Description                                                        |
| ---------------- | ------------------------ | -------- | ------------------------------------------------------------------ |
| `title`          | `string`                 | ✅       | Page title (without suffix).                                       |
| `description`    | `string`                 | ✅       | Short page description.                                            |
| `image`          | `string`                 | —        | Overrides `defaultImage`.                                          |
| `imageAlt`       | `string`                 | —        | Alt text for OG image. Defaults to `"<title> - <siteName>"`.       |
| `imageWidth`     | `number`                 | —        | OG image width in px. Defaults to `1200`.                          |
| `imageHeight`    | `number`                 | —        | OG image height in px. Defaults to `630`.                          |
| `path`           | `string`                 | —        | Slug appended to `baseUrl` for the canonical URL, e.g. `"/about"`. |
| `siteName`       | `string`                 | —        | Overrides global `siteName`. Pass `""` to suppress the suffix.     |
| `baseUrl`        | `string`                 | —        | Overrides global `baseUrl`.                                        |
| `noIndex`        | `boolean`                | —        | Sets `robots: { index: false, follow: false }` when `true`.        |
| `locale`         | `string`                 | —        | Overrides global `locale` for `og:locale`.                         |
| `keywords`       | `string[]`               | —        | Merged with global keywords (de-duplicated).                       |
| `author`         | `string`                 | —        | Overrides global author.                                           |
| `type`           | `string`                 | —        | Override `og:type`. Defaults to `"website"`.                       |
| `alternates`     | `Record<string, string>` | —        | Per-page language alternates (locale → URL/path).                  |
| `structuredData` | `Record \| Record[]`     | —        | JSON-LD structured data object(s).                                 |

---

### Structured Data Helpers

#### `personSchema(props: PersonSchemaProps): Record<string, unknown>`

Generates a Schema.org `Person` JSON-LD object.

#### `articleSchema(props: ArticleSchemaProps): Record<string, unknown>`

Generates a Schema.org `Article` / `BlogPosting` JSON-LD object.

#### `organizationSchema(props: OrganizationSchemaProps): Record<string, unknown>`

Generates a Schema.org `Organization` JSON-LD object.

#### `JsonLd({ data }: JsonLdProps): ReactElement`

Renders a `<script type="application/ld+json">` tag directly. Accepts a single schema object or an array. No wrapper elements, no hydration issues.

```tsx
import { JsonLd, personSchema } from "@coldbydefault/next-seo-lite";
<JsonLd data={personSchema({ name: "Jane", url: "https://jane.dev" })} />
````

#### `jsonLdScript(data): string` _(deprecated)_

Serialises JSON-LD into a `<script type="application/ld+json">` tag string for use with `dangerouslySetInnerHTML`. Prefer `<JsonLd>` instead.

---

## What This Gets You (Lighthouse SEO)

| Check                             | Status |
| --------------------------------- | ------ |
| `<title>` element                 | ✅     |
| Meta description                  | ✅     |
| Valid canonical                   | ✅     |
| hreflang alternates               | ✅     |
| Open Graph tags                   | ✅     |
| Twitter Card tags                 | ✅     |
| robots / googleBot directives     | ✅     |
| Structured data (JSON-LD)         | ✅     |
| `metadataBase` for URL resolution | ✅     |
| Keywords meta tag                 | ✅     |
| Author / Publisher                | ✅     |

---

## License

MIT
