/**
 * @Author ColdByDefault 2026
 * @MIT License
 */

import { describe, it, expect } from "vitest";
import {
  defineSEO,
  createSEOConfig,
  personSchema,
  articleSchema,
  organizationSchema,
  jsonLdScript,
} from "../index";

// ---------------------------------------------------------------------------
// defineSEO – standalone
// ---------------------------------------------------------------------------

describe("defineSEO (standalone)", () => {
  it("builds a title with site name suffix", () => {
    const metadata = defineSEO({
      title: "Home",
      description: "Welcome to my site.",
      siteName: "MyBrand",
    });

    expect(metadata.title).toBe("Home | MyBrand");
    expect((metadata.openGraph as Record<string, unknown>)?.title).toBe(
      "Home | MyBrand",
    );
    expect((metadata.twitter as Record<string, unknown>)?.title).toBe(
      "Home | MyBrand",
    );
  });

  it("uses the plain title when no siteName is provided", () => {
    const metadata = defineSEO({
      title: "About Us",
      description: "Learn more about us.",
    });

    expect(metadata.title).toBe("About Us");
  });

  it("suppresses the siteName suffix when siteName is an empty string", () => {
    const metadata = defineSEO({
      title: "Contact",
      description: "Get in touch.",
      siteName: "",
    });

    expect(metadata.title).toBe("Contact");
  });

  it("populates openGraph and twitter images when an image is given", () => {
    const image = "https://example.com/og.png";
    const metadata = defineSEO({
      title: "Blog",
      description: "All posts.",
      image,
    });

    const og = metadata.openGraph as Record<string, unknown>;
    const images = og?.images as {
      url: string;
      width: number;
      height: number;
      alt: string;
    }[];
    expect(images?.[0]?.url).toBe(image);
    expect(images?.[0]?.width).toBe(1200);
    expect(images?.[0]?.height).toBe(630);
    expect((metadata.twitter as Record<string, unknown>)?.images).toEqual([
      image,
    ]);
  });

  it("sets twitter card to summary_large_image when an image is provided", () => {
    const metadata = defineSEO({
      title: "Portfolio",
      description: "My work.",
      image: "https://example.com/portfolio-og.png",
    });

    expect((metadata.twitter as Record<string, unknown>)?.card).toBe(
      "summary_large_image",
    );
  });

  it("sets twitter card to summary when no image is provided", () => {
    const metadata = defineSEO({
      title: "Portfolio",
      description: "My work.",
    });

    expect((metadata.twitter as Record<string, unknown>)?.card).toBe("summary");
  });

  it("sets robots noIndex when noIndex is true", () => {
    const metadata = defineSEO({
      title: "Dashboard",
      description: "Private page.",
      noIndex: true,
    });

    expect((metadata.robots as Record<string, unknown>)?.index).toBe(false);
    expect((metadata.robots as Record<string, unknown>)?.follow).toBe(false);
  });

  it("sets comprehensive robots with googleBot when noIndex is not set", () => {
    const metadata = defineSEO({
      title: "Home",
      description: "Public page.",
    });

    const robots = metadata.robots as Record<string, unknown>;
    expect(robots?.index).toBe(true);
    expect(robots?.follow).toBe(true);
    const googleBot = robots?.googleBot as Record<string, unknown>;
    expect(googleBot?.index).toBe(true);
    expect(googleBot?.follow).toBe(true);
    expect(googleBot?.["max-video-preview"]).toBe(-1);
    expect(googleBot?.["max-image-preview"]).toBe("large");
    expect(googleBot?.["max-snippet"]).toBe(-1);
  });

  it("sets og:locale when locale is provided", () => {
    const metadata = defineSEO({
      title: "Accueil",
      description: "Page française.",
      locale: "fr_FR",
    });

    expect((metadata.openGraph as Record<string, unknown>)?.locale).toBe(
      "fr_FR",
    );
  });

  it("leaves images empty when no image is provided", () => {
    const metadata = defineSEO({
      title: "FAQ",
      description: "Frequently asked questions.",
    });

    const og = metadata.openGraph as Record<string, unknown>;
    expect(og?.images).toBeUndefined();
    expect(
      (metadata.twitter as Record<string, unknown>)?.images,
    ).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// defineSEO – keywords
// ---------------------------------------------------------------------------

describe("defineSEO – keywords", () => {
  it("sets keywords when provided", () => {
    const metadata = defineSEO({
      title: "Home",
      description: "Welcome.",
      keywords: ["react", "nextjs", "seo"],
    });

    expect(metadata.keywords).toEqual(["react", "nextjs", "seo"]);
  });

  it("omits keywords when none are provided", () => {
    const metadata = defineSEO({
      title: "Home",
      description: "Welcome.",
    });

    expect(metadata.keywords).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// defineSEO – author / publisher
// ---------------------------------------------------------------------------

describe("defineSEO – author & publisher", () => {
  it("sets author, creator, and publisher when provided", () => {
    const metadata = defineSEO({
      title: "About",
      description: "About me.",
      author: "Jane Doe",
      siteName: "JaneBrand",
    });

    expect(metadata.authors).toEqual([{ name: "Jane Doe" }]);
    expect(metadata.creator).toBe("Jane Doe");
    expect(metadata.publisher).toBe("JaneBrand");
  });

  it("omits author fields when not provided", () => {
    const metadata = defineSEO({
      title: "Home",
      description: "Welcome.",
    });

    expect(metadata.authors).toBeUndefined();
    expect(metadata.creator).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// defineSEO – OG image details
// ---------------------------------------------------------------------------

describe("defineSEO – OG image details", () => {
  it("uses custom width, height, and alt for OG image", () => {
    const metadata = defineSEO({
      title: "Gallery",
      description: "Photo gallery.",
      image: "https://example.com/gallery.png",
      imageAlt: "Gallery preview",
      imageWidth: 800,
      imageHeight: 400,
    });

    const og = metadata.openGraph as Record<string, unknown>;
    const images = og?.images as {
      url: string;
      width: number;
      height: number;
      alt: string;
    }[];
    expect(images?.[0]).toEqual({
      url: "https://example.com/gallery.png",
      width: 800,
      height: 400,
      alt: "Gallery preview",
    });
  });

  it("auto-generates imageAlt from title + siteName", () => {
    const metadata = defineSEO({
      title: "Products",
      description: "Our products.",
      image: "https://example.com/products.png",
      siteName: "MyShop",
    });

    const og = metadata.openGraph as Record<string, unknown>;
    const images = og?.images as { url: string; alt: string }[];
    expect(images?.[0]?.alt).toBe("Products - MyShop");
  });

  it("uses title-only alt when no siteName", () => {
    const metadata = defineSEO({
      title: "Products",
      description: "Our products.",
      image: "https://example.com/products.png",
    });

    const og = metadata.openGraph as Record<string, unknown>;
    const images = og?.images as { url: string; alt: string }[];
    expect(images?.[0]?.alt).toBe("Products");
  });
});

// ---------------------------------------------------------------------------
// defineSEO – og:type
// ---------------------------------------------------------------------------

describe("defineSEO – og:type", () => {
  it("defaults to website", () => {
    const metadata = defineSEO({
      title: "Home",
      description: "Welcome.",
    });

    expect((metadata.openGraph as Record<string, unknown>)?.type).toBe(
      "website",
    );
  });

  it("allows overriding to article", () => {
    const metadata = defineSEO({
      title: "Blog Post",
      description: "A post.",
      type: "article",
    });

    expect((metadata.openGraph as Record<string, unknown>)?.type).toBe(
      "article",
    );
  });
});

// ---------------------------------------------------------------------------
// defineSEO – metadataBase
// ---------------------------------------------------------------------------

describe("defineSEO – metadataBase", () => {
  it("sets metadataBase when baseUrl is provided", () => {
    const metadata = defineSEO({
      title: "Home",
      description: "Welcome.",
      baseUrl: "https://example.com",
      path: "/",
    });

    expect(metadata.metadataBase).toEqual(new URL("https://example.com"));
  });

  it("omits metadataBase when no baseUrl", () => {
    const metadata = defineSEO({
      title: "Home",
      description: "Welcome.",
    });

    expect(metadata.metadataBase).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// defineSEO – canonical URLs
// ---------------------------------------------------------------------------

describe("defineSEO – canonical URLs", () => {
  it("generates a canonical URL from baseUrl + path", () => {
    const metadata = defineSEO({
      title: "About",
      description: "About page.",
      baseUrl: "https://example.com",
      path: "/about",
    });

    expect((metadata.alternates as Record<string, unknown>)?.canonical).toBe(
      "https://example.com/about",
    );
    expect((metadata.openGraph as Record<string, unknown>)?.url).toBe(
      "https://example.com/about",
    );
  });

  it("handles a baseUrl without a trailing slash", () => {
    const metadata = defineSEO({
      title: "Home",
      description: "Welcome.",
      baseUrl: "https://example.com",
      path: "/",
    });

    expect((metadata.alternates as Record<string, unknown>)?.canonical).toBe(
      "https://example.com",
    );
  });

  it("omits canonical when no baseUrl is supplied", () => {
    const metadata = defineSEO({
      title: "Home",
      description: "Welcome.",
    });

    expect(metadata.alternates).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// defineSEO – hreflang alternates
// ---------------------------------------------------------------------------

describe("defineSEO – hreflang alternates", () => {
  it("generates language alternates from page-level alternates", () => {
    const metadata = defineSEO({
      title: "About",
      description: "About page.",
      baseUrl: "https://example.com",
      path: "/about",
      alternates: {
        en: "https://example.com/about",
        de: "https://example.com/de/about",
      },
    });

    const alternates = metadata.alternates as Record<string, unknown>;
    const languages = alternates?.languages as Record<string, string>;
    expect(languages?.en).toBe("https://example.com/about");
    expect(languages?.de).toBe("https://example.com/de/about");
  });

  it("resolves relative page-level alternates against baseUrl", () => {
    const metadata = defineSEO({
      title: "About",
      description: "About page.",
      baseUrl: "https://example.com",
      path: "/about",
      alternates: {
        en: "/about",
        de: "/de/about",
      },
    });

    const alternates = metadata.alternates as Record<string, unknown>;
    const languages = alternates?.languages as Record<string, string>;
    expect(languages?.en).toBe("https://example.com/about");
    expect(languages?.de).toBe("https://example.com/de/about");
  });
});

// ---------------------------------------------------------------------------
// createSEOConfig – factory
// ---------------------------------------------------------------------------

describe("createSEOConfig", () => {
  const seoWithConfig = createSEOConfig({
    siteName: "AcmeCorp",
    baseUrl: "https://acme.com",
    defaultImage: "https://acme.com/default-og.png",
  });

  it("uses custom titleSeparator", () => {
    const seo = createSEOConfig({ siteName: "MyBrand", titleSeparator: "–" });
    const metadata = seo({ title: "Home", description: "Welcome." });
    expect(metadata.title).toBe("Home – MyBrand");
  });

  it("defaults titleSeparator to |", () => {
    const seo = createSEOConfig({ siteName: "MyBrand" });
    const metadata = seo({ title: "Home", description: "Welcome." });
    expect(metadata.title).toBe("Home | MyBrand");
  });

  it("applies global locale to og:locale", () => {
    const seo = createSEOConfig({ locale: "en_US" });
    const metadata = seo({ title: "Home", description: "Welcome." });
    expect((metadata.openGraph as Record<string, unknown>)?.locale).toBe(
      "en_US",
    );
  });

  it("page-level locale overrides the global locale", () => {
    const seo = createSEOConfig({ locale: "en_US" });
    const metadata = seo({
      title: "Accueil",
      description: "Bienvenue.",
      locale: "fr_FR",
    });
    expect((metadata.openGraph as Record<string, unknown>)?.locale).toBe(
      "fr_FR",
    );
  });

  it("applies global siteName to every page", () => {
    const metadata = seoWithConfig({
      title: "Products",
      description: "Our products.",
    });
    expect(metadata.title).toBe("Products | AcmeCorp");
  });

  it("falls back to the global defaultImage", () => {
    const metadata = seoWithConfig({ title: "Blog", description: "Posts." });
    const og = metadata.openGraph as Record<string, unknown>;
    const images = og?.images as { url: string }[];
    expect(images?.[0]?.url).toBe("https://acme.com/default-og.png");
  });

  it("page-level image overrides the global defaultImage", () => {
    const pageImage = "https://acme.com/blog-og.png";
    const metadata = seoWithConfig({
      title: "Post",
      description: "A blog post.",
      image: pageImage,
    });
    const og = metadata.openGraph as Record<string, unknown>;
    const images = og?.images as { url: string }[];
    expect(images?.[0]?.url).toBe(pageImage);
  });

  it("page-level siteName overrides the global siteName", () => {
    const metadata = seoWithConfig({
      title: "Special Page",
      description: "Custom brand.",
      siteName: "SpecialBrand",
    });
    expect(metadata.title).toBe("Special Page | SpecialBrand");
  });

  it("builds canonical from global baseUrl + page path", () => {
    const metadata = seoWithConfig({
      title: "About",
      description: "About.",
      path: "/about",
    });
    expect((metadata.alternates as Record<string, unknown>)?.canonical).toBe(
      "https://acme.com/about",
    );
  });

  it("merges global and page-level keywords (deduplicated)", () => {
    const seo = createSEOConfig({
      siteName: "MyBrand",
      keywords: ["react", "nextjs"],
    });
    const metadata = seo({
      title: "Blog",
      description: "Posts.",
      keywords: ["nextjs", "seo", "blog"],
    });
    expect(metadata.keywords).toEqual(["react", "nextjs", "seo", "blog"]);
  });

  it("applies global author to every page", () => {
    const seo = createSEOConfig({
      siteName: "MyBrand",
      author: "Jane Doe",
    });
    const metadata = seo({ title: "Home", description: "Welcome." });
    expect(metadata.authors).toEqual([{ name: "Jane Doe" }]);
    expect(metadata.creator).toBe("Jane Doe");
  });

  it("applies global twitterHandle as creator and site", () => {
    const seo = createSEOConfig({
      siteName: "MyBrand",
      twitterHandle: "@mybrand",
    });
    const metadata = seo({ title: "Home", description: "Welcome." });
    const twitter = metadata.twitter as Record<string, unknown>;
    expect(twitter?.creator).toBe("@mybrand");
    expect(twitter?.site).toBe("@mybrand");
  });

  it("applies global publisher from config", () => {
    const seo = createSEOConfig({
      siteName: "MyBrand",
      publisher: "MyBrand Publishing",
    });
    const metadata = seo({ title: "Home", description: "Welcome." });
    expect(metadata.publisher).toBe("MyBrand Publishing");
  });

  it("falls back publisher to siteName when not set", () => {
    const seo = createSEOConfig({ siteName: "MyBrand" });
    const metadata = seo({ title: "Home", description: "Welcome." });
    expect(metadata.publisher).toBe("MyBrand");
  });

  it("builds hreflang from global alternateLocales + page path", () => {
    const seo = createSEOConfig({
      siteName: "MyBrand",
      baseUrl: "https://example.com",
      alternateLocales: { en: "", de: "/de" },
    });
    const metadata = seo({
      title: "About",
      description: "About.",
      path: "/about",
    });
    const alternates = metadata.alternates as Record<string, unknown>;
    const languages = alternates?.languages as Record<string, string>;
    expect(languages?.en).toBe("https://example.com/about");
    expect(languages?.de).toBe("https://example.com/de/about");
  });
});

// ---------------------------------------------------------------------------
// Structured data helpers
// ---------------------------------------------------------------------------

describe("personSchema", () => {
  it("generates a valid Person JSON-LD", () => {
    const schema = personSchema({
      name: "Jane Doe",
      url: "https://janedoe.dev",
      jobTitle: "Full Stack Developer",
      description: "A developer.",
      email: "jane@example.com",
      image: "https://janedoe.dev/photo.jpg",
      sameAs: ["https://github.com/janedoe"],
      knowsAbout: ["React", "Next.js"],
      location: "Berlin, Germany",
      worksFor: { name: "Acme Corp", url: "https://acme.com" },
    });

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Person");
    expect(schema.name).toBe("Jane Doe");
    expect(schema.jobTitle).toBe("Full Stack Developer");
    expect(schema.email).toBe("jane@example.com");
    expect(schema.sameAs).toEqual(["https://github.com/janedoe"]);
    expect(schema.knowsAbout).toEqual(["React", "Next.js"]);
    expect(schema.address).toEqual({
      "@type": "Place",
      name: "Berlin, Germany",
    });
    expect(schema.worksFor).toEqual({
      "@type": "Organization",
      name: "Acme Corp",
      url: "https://acme.com",
    });
  });

  it("omits optional fields when not provided", () => {
    const schema = personSchema({
      name: "Jane Doe",
      url: "https://janedoe.dev",
    });

    expect(schema.name).toBe("Jane Doe");
    expect(schema.url).toBe("https://janedoe.dev");
    expect(schema.jobTitle).toBeUndefined();
    expect(schema.email).toBeUndefined();
    expect(schema.sameAs).toBeUndefined();
    expect(schema.worksFor).toBeUndefined();
  });
});

describe("articleSchema", () => {
  it("generates a valid BlogPosting JSON-LD", () => {
    const schema = articleSchema({
      headline: "Getting Started with Next.js",
      description: "A beginner guide.",
      url: "https://blog.com/nextjs",
      image: "https://blog.com/nextjs.jpg",
      datePublished: "2025-01-15T10:00:00Z",
      dateModified: "2025-02-01T12:00:00Z",
      authorName: "Jane Doe",
      authorUrl: "https://janedoe.dev",
      publisherName: "MyBlog",
      publisherLogo: "https://blog.com/logo.png",
      wordCount: 1500,
      readingTime: 7,
      keywords: ["Next.js", "React"],
      articleSection: "Tutorials",
    });

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("BlogPosting");
    expect(schema.headline).toBe("Getting Started with Next.js");
    expect(schema.mainEntityOfPage).toBe("https://blog.com/nextjs");
    expect(schema.author).toEqual({
      "@type": "Person",
      name: "Jane Doe",
      url: "https://janedoe.dev",
    });
    expect(schema.publisher).toEqual({
      "@type": "Organization",
      name: "MyBlog",
      logo: "https://blog.com/logo.png",
    });
    expect(schema.wordCount).toBe(1500);
    expect(schema.timeRequired).toBe("PT7M");
    expect(schema.keywords).toEqual(["Next.js", "React"]);
    expect(schema.articleSection).toBe("Tutorials");
  });

  it("allows overriding @type to Article", () => {
    const schema = articleSchema({
      headline: "News",
      description: "Breaking.",
      url: "https://news.com/1",
      datePublished: "2025-03-01",
      authorName: "Editor",
      type: "Article",
    });

    expect(schema["@type"]).toBe("Article");
  });
});

describe("organizationSchema", () => {
  it("generates a valid Organization JSON-LD", () => {
    const schema = organizationSchema({
      name: "Acme Corp",
      url: "https://acme.com",
      logo: "https://acme.com/logo.png",
      description: "We build things.",
      sameAs: ["https://twitter.com/acme"],
      email: "info@acme.com",
    });

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Organization");
    expect(schema.name).toBe("Acme Corp");
    expect(schema.logo).toBe("https://acme.com/logo.png");
    expect(schema.sameAs).toEqual(["https://twitter.com/acme"]);
  });
});

describe("jsonLdScript", () => {
  it("serialises a single schema to a script tag", () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Jane",
    };
    const html = jsonLdScript(schema);
    expect(html).toContain('<script type="application/ld+json">');
    expect(html).toContain('"@type":"Person"');
    expect(html).toContain("</script>");
  });

  it("serialises an array of schemas", () => {
    const schemas = [
      { "@context": "https://schema.org", "@type": "Person", name: "Jane" },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Acme",
      },
    ];
    const html = jsonLdScript(schemas);
    expect(html).toContain('"@type":"Person"');
    expect(html).toContain('"@type":"Organization"');
  });
});
