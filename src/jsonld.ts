/**
 * @Author ColdByDefault 2026
 * @MIT License
 */

import * as React from "react";
import type { JsonLdProps } from "./types";

// ---------------------------------------------------------------------------
// JSON-LD Utilities
// ---------------------------------------------------------------------------

/**
 * Serialise one or more JSON-LD objects into a `<script>` tag string.
 *
 * @deprecated Prefer the `<JsonLd>` component which avoids wrapper `<div>`
 * elements and hydration mismatches in Next.js. Kept for backward
 * compatibility.
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

// ---------------------------------------------------------------------------
// JsonLd React Component
// ---------------------------------------------------------------------------

/**
 * Renders a `<script type="application/ld+json">` tag with the given
 * structured-data payload. Drop it anywhere in your component tree —
 * inside `<head>` (via Next.js `metadata`) or `<body>` — without wrapper
 * elements or hydration issues.
 *
 * @example
 * import { JsonLd, personSchema } from '@coldbydefault/next-seo-lite';
 *
 * const person = personSchema({ name: 'Jane', url: 'https://jane.dev' });
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         <JsonLd data={person} />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 */
export function JsonLd({ data }: JsonLdProps): React.ReactElement {
  return React.createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  });
}
