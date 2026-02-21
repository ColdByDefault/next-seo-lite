import { describe, it, expect } from 'vitest';
import { defineSEO, createSEOConfig } from '../index';

// ---------------------------------------------------------------------------
// defineSEO – standalone
// ---------------------------------------------------------------------------

describe('defineSEO (standalone)', () => {
  it('builds a title with site name suffix', () => {
    const metadata = defineSEO({
      title: 'Home',
      description: 'Welcome to my site.',
      siteName: 'MyBrand',
    });

    expect(metadata.title).toBe('Home | MyBrand');
    expect((metadata.openGraph as Record<string, unknown>)?.title).toBe(
      'Home | MyBrand',
    );
    expect((metadata.twitter as Record<string, unknown>)?.title).toBe(
      'Home | MyBrand',
    );
  });

  it('uses the plain title when no siteName is provided', () => {
    const metadata = defineSEO({
      title: 'About Us',
      description: 'Learn more about us.',
    });

    expect(metadata.title).toBe('About Us');
  });

  it('suppresses the siteName suffix when siteName is an empty string', () => {
    const metadata = defineSEO({
      title: 'Contact',
      description: 'Get in touch.',
      siteName: '',
    });

    expect(metadata.title).toBe('Contact');
  });

  it('populates openGraph and twitter images when an image is given', () => {
    const image = 'https://example.com/og.png';
    const metadata = defineSEO({
      title: 'Blog',
      description: 'All posts.',
      image,
    });

    const og = metadata.openGraph as Record<string, unknown>;
    expect(og?.images).toEqual([{ url: image }]);
    expect((metadata.twitter as Record<string, unknown>)?.images).toEqual([
      image,
    ]);
  });

  it('sets twitter card to summary_large_image', () => {
    const metadata = defineSEO({
      title: 'Portfolio',
      description: 'My work.',
    });

    expect((metadata.twitter as Record<string, unknown>)?.card).toBe(
      'summary_large_image',
    );
  });

  it('leaves images empty when no image is provided', () => {
    const metadata = defineSEO({
      title: 'FAQ',
      description: 'Frequently asked questions.',
    });

    const og = metadata.openGraph as Record<string, unknown>;
    expect(og?.images).toBeUndefined();
    expect((metadata.twitter as Record<string, unknown>)?.images).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// defineSEO – canonical URLs
// ---------------------------------------------------------------------------

describe('defineSEO – canonical URLs', () => {
  it('generates a canonical URL from baseUrl + path', () => {
    const metadata = defineSEO({
      title: 'About',
      description: 'About page.',
      baseUrl: 'https://example.com',
      path: '/about',
    });

    expect(
      (metadata.alternates as Record<string, unknown>)?.canonical,
    ).toBe('https://example.com/about');
    expect(
      (metadata.openGraph as Record<string, unknown>)?.url,
    ).toBe('https://example.com/about');
  });

  it('handles a baseUrl without a trailing slash', () => {
    const metadata = defineSEO({
      title: 'Home',
      description: 'Welcome.',
      baseUrl: 'https://example.com',
      path: '/',
    });

    expect(
      (metadata.alternates as Record<string, unknown>)?.canonical,
    ).toBe('https://example.com');
  });

  it('omits canonical when no baseUrl is supplied', () => {
    const metadata = defineSEO({
      title: 'Home',
      description: 'Welcome.',
    });

    expect(metadata.alternates).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// createSEOConfig – factory
// ---------------------------------------------------------------------------

describe('createSEOConfig', () => {
  const seoWithConfig = createSEOConfig({
    siteName: 'AcmeCorp',
    baseUrl: 'https://acme.com',
    defaultImage: 'https://acme.com/default-og.png',
  });

  it('applies global siteName to every page', () => {
    const metadata = seoWithConfig({ title: 'Products', description: 'Our products.' });
    expect(metadata.title).toBe('Products | AcmeCorp');
  });

  it('falls back to the global defaultImage', () => {
    const metadata = seoWithConfig({ title: 'Blog', description: 'Posts.' });
    const og = metadata.openGraph as Record<string, unknown>;
    expect(og?.images).toEqual([{ url: 'https://acme.com/default-og.png' }]);
  });

  it('page-level image overrides the global defaultImage', () => {
    const pageImage = 'https://acme.com/blog-og.png';
    const metadata = seoWithConfig({
      title: 'Post',
      description: 'A blog post.',
      image: pageImage,
    });
    const og = metadata.openGraph as Record<string, unknown>;
    expect(og?.images).toEqual([{ url: pageImage }]);
  });

  it('page-level siteName overrides the global siteName', () => {
    const metadata = seoWithConfig({
      title: 'Special Page',
      description: 'Custom brand.',
      siteName: 'SpecialBrand',
    });
    expect(metadata.title).toBe('Special Page | SpecialBrand');
  });

  it('builds canonical from global baseUrl + page path', () => {
    const metadata = seoWithConfig({ title: 'About', description: 'About.', path: '/about' });
    expect(
      (metadata.alternates as Record<string, unknown>)?.canonical,
    ).toBe('https://acme.com/about');
  });
});
