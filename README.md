# next-seo-lite

> **Stop writing 50 lines of Meta tags. Do it in 5.**

A tiny, zero-runtime-dependency SEO helper for [Next.js](https://nextjs.org/) App Router.  
It turns simple props into the full `Metadata` object Next.js expects — including `openGraph`, `twitter`, and automatic canonical URLs.

---

## Features

- **Title suffixing** — `"Home"` becomes `"Home | MyBrand"` automatically.
- **OpenGraph** — fills `og:title`, `og:description`, and `og:image` in one call.
- **Twitter Cards** — maps your image to `summary_large_image` by default.
- **Canonical URLs** — combine a `baseUrl` with a page `path` and you're done.
- **Default fallback image** — set once at the root, used everywhere you don't override it.
- **Zero runtime dependencies** — only `next` as a peer dep (for types).

---

## Installation

This package is published to **both npm and GitHub Packages** — use whichever fits your workflow.

### Option A — npm (recommended, zero friction)

```bash
npm install @coldbydefault/next-seo-lite
# or
yarn add @coldbydefault/next-seo-lite
# or
pnpm add @coldbydefault/next-seo-lite
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
npm install @coldbydefault/next-seo-lite
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
});
```

That one call replaces this:

```tsx
export const metadata: Metadata = {
  title: "About Us | MyBrand",
  description: "Learn more about our team.",
  openGraph: {
    title: "About Us | MyBrand",
    description: "Learn more about our team.",
    images: [{ url: "https://mysite.com/about-og.png" }],
    type: "website",
    siteName: "MyBrand",
    url: "https://mysite.com/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | MyBrand",
    description: "Learn more about our team.",
    images: ["https://mysite.com/about-og.png"],
  },
  alternates: {
    canonical: "https://mysite.com/about",
  },
};
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
    image: post.coverImage, // overrides the global defaultImage
    path: `/blog/${params.slug}`,
  });
}
```

---

## API Reference

### `defineSEO(props: SEOProps): Metadata`

Standalone helper — no global config needed.

### `createSEOConfig(config: SEOConfig): (props: SEOProps) => Metadata`

Returns a `defineSEO` function pre-loaded with your global defaults.  
Page-level props always win over the global config.

---

### `SEOConfig`

| Prop           | Type     | Description                                                          |
| -------------- | -------- | -------------------------------------------------------------------- | ----------- |
| `siteName`     | `string` | Appended to every title: `"Page                                      | SiteName"`. |
| `baseUrl`      | `string` | Absolute base URL for canonical links, e.g. `"https://example.com"`. |
| `defaultImage` | `string` | Fallback OG / Twitter image URL.                                     |

---

### `SEOProps`

| Prop           | Type     | Required | Description                                                        |
| -------------- | -------- | -------- | ------------------------------------------------------------------ |
| `title`        | `string` | ✅       | Page title (without suffix).                                       |
| `description`  | `string` | ✅       | Short page description.                                            |
| `image`        | `string` | —        | Overrides `defaultImage`.                                          |
| `path`         | `string` | —        | Slug appended to `baseUrl` for the canonical URL, e.g. `"/about"`. |
| `siteName`     | `string` | —        | Overrides global `siteName`. Pass `""` to suppress the suffix.     |
| `baseUrl`      | `string` | —        | Overrides global `baseUrl`.                                        |
| `defaultImage` | `string` | —        | Overrides global `defaultImage` for this call.                     |

---

## License

MIT
