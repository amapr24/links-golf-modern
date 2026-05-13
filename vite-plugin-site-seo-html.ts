import type { Plugin } from "vite";
import { loadEnv } from "vite";

/**
 * Injects canonical + og:url and absolute og/twitter image URLs when
 * `VITE_PUBLIC_SITE_ORIGIN` is set at build (or dev) time.
 *
 * Optional Spanish hints for crawlers (no duplicate og:description):
 * `VITE_OG_TITLE_ES`, `VITE_OG_DESCRIPTION_ES` → JSON-LD WebSite
 * `alternateName` + `abstract` + `inLanguage` (see schema.org/WebSite).
 */
export function siteSeoHtmlPlugin(options: {
  envDir: string;
}): Plugin {
  const { envDir } = options;
  let mode = "production";

  return {
    name: "site-seo-html",
    configResolved(config) {
      mode = config.mode;
    },
    transformIndexHtml(html) {
      const env = loadEnv(mode, envDir, "VITE");
      const origin = normalizeSiteOrigin(env.VITE_PUBLIC_SITE_ORIGIN);
      let out = html;

      if (origin) {
        const ogImageAbs = `${origin}/og-share.png`;
        out = out.replaceAll(
          '<meta property="og:image" content="/og-share.png" />',
          `<meta property="og:image" content="${ogImageAbs}" />`
        );
        out = out.replaceAll(
          '<meta name="twitter:image" content="/og-share.png" />',
          `<meta name="twitter:image" content="${ogImageAbs}" />`
        );
        if (!out.includes('rel="canonical"')) {
          out = out.replace(
            /<meta name="description" content="[^"]*" \/>/,
            (m) =>
              `${m}\n    <link rel="canonical" href="${origin}/" />\n    <meta property="og:url" content="${origin}/" />`
          );
        }
      }

      const titleEs = env.VITE_OG_TITLE_ES?.trim();
      const descEs = env.VITE_OG_DESCRIPTION_ES?.trim();
      if (titleEs || descEs) {
        const jsonLd: Record<string, unknown> = {
          "@context": "https://schema.org",
          "@type": "WebSite",
          inLanguage: ["en-US", "es-PR"],
        };
        if (origin) jsonLd.url = `${origin}/`;
        if (titleEs) jsonLd.alternateName = titleEs;
        if (descEs) jsonLd.abstract = descEs;
        const serialized = JSON.stringify(jsonLd).replace(/</g, "\\u003c");
        const script = `    <script type="application/ld+json">${serialized}</script>`;
        out = out.replace("</head>", `${script}\n</head>`);
      }

      return out;
    },
  };
}

function normalizeSiteOrigin(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const t = raw.trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(t)) return null;
  if (/["'<>]/.test(t)) return null;
  try {
    const u = new URL(t);
    if (u.username || u.password) return null;
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}
