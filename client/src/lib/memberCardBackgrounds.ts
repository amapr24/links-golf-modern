/**
 * Member card backgrounds from the Unsplash **Golf** collection:
 * https://unsplash.com/collections/bJnL-rJ3zAM/golf
 *
 * When `VITE_UNSPLASH_ACCESS_KEY` is set, URLs are loaded live from the Unsplash API
 * (see https://unsplash.com/documentation#get-a-collections-photos). Otherwise we use
 * the same collection’s public `images.unsplash.com` URLs as a static fallback (no key).
 */

export const UNSPLASH_GOLF_COLLECTION_ID = "bJnL-rJ3zAM";

export type MemberCardBackground = {
  url: string;
  /** Screen-reader credit (API supplies photographer; fallback is generic). */
  credit?: string;
};

/** Stable hotlinks for this collection (same photos as on the collection page). */
const FALLBACK_BACKGROUNDS: MemberCardBackground[] = [
  "https://images.unsplash.com/photo-1662224107342-c2bfd01a17f1",
  "https://images.unsplash.com/photo-1690288505632-bb7f38d663d4",
  "https://images.unsplash.com/photo-1538423070486-9292881ea10a",
  "https://images.unsplash.com/photo-1627955433445-d233480dd65d",
  "https://images.unsplash.com/photo-1701428180979-67cf3a5c6ad1",
  "https://images.unsplash.com/photo-1696104470342-b1ed3afe8381",
  "https://images.unsplash.com/photo-1604702686571-f03d002a7c53",
  "https://images.unsplash.com/photo-1584837140804-599306fb37f9",
  "https://images.unsplash.com/photo-1632244112951-95b29c92eee1",
  "https://images.unsplash.com/photo-1591491698714-9631092f6c4f",
  "https://images.unsplash.com/photo-1562204320-31975a5e09ce",
  "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa",
  "https://images.unsplash.com/photo-1632946269126-0f8edbe8b068",
  "https://images.unsplash.com/photo-1535131749006-b7f58c99034b",
  "https://images.unsplash.com/photo-1500932334442-8761ee4810a7",
].map((base) => ({
  url: withCardImageParams(base),
  credit:
    "Background from the Unsplash Golf collection. https://unsplash.com/collections/bJnL-rJ3zAM/golf",
}));

function fromAnyUnsplashPhotoUrl(photoUrl: string): string {
  const u = new URL(photoUrl);
  return withCardImageParams(`${u.origin}${u.pathname}`);
}

function withCardImageParams(imageBase: string): string {
  const u = new URL(imageBase);
  u.searchParams.set("auto", "format");
  u.searchParams.set("fit", "crop");
  u.searchParams.set("w", "1200");
  u.searchParams.set("q", "82");
  u.searchParams.set("ixlib", "rb-4.1.0");
  return u.toString();
}

type UnsplashPhoto = {
  urls: { regular: string };
  user: { name: string; links: { html: string } };
};

async function fetchCollectionPhotosFromApi(accessKey: string): Promise<MemberCardBackground[]> {
  const out: MemberCardBackground[] = [];
  const seen = new Set<string>();
  const perPage = 30;

  for (let page = 1; page <= 8; page++) {
    const url = new URL(
      `https://api.unsplash.com/collections/${UNSPLASH_GOLF_COLLECTION_ID}/photos`,
    );
    url.searchParams.set("client_id", accessKey);
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("page", String(page));
    url.searchParams.set("orientation", "landscape");

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`Unsplash API ${res.status}`);
    }
    const photos: UnsplashPhoto[] = await res.json();
    if (!photos.length) break;

    for (const p of photos) {
      const normalized = fromAnyUnsplashPhotoUrl(p.urls.regular);
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      const authorLink = `${p.user.links.html}?utm_source=links_golf&utm_medium=referral&utm_campaign=api-credit`;
      out.push({
        url: normalized,
        credit: `Background photo by ${p.user.name} on Unsplash. ${authorLink}`,
      });
    }

    if (photos.length < perPage) break;
  }

  return out;
}

let cachedPool: MemberCardBackground[] | null = null;
let inflight: Promise<MemberCardBackground[]> | null = null;

/**
 * Resolves the pool of backgrounds (cached). Prefers the Unsplash API when
 * `import.meta.env.VITE_UNSPLASH_ACCESS_KEY` is set; otherwise uses static URLs
 * from the same collection.
 */
export function loadMemberCardBackgroundPool(): Promise<MemberCardBackground[]> {
  if (cachedPool?.length) return Promise.resolve(cachedPool);
  if (!inflight) {
    inflight = (async (): Promise<MemberCardBackground[]> => {
      const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined;
      if (accessKey) {
        try {
          const fromApi = await fetchCollectionPhotosFromApi(accessKey);
          if (fromApi.length) {
            cachedPool = fromApi;
            return cachedPool;
          }
        } catch (e) {
          console.warn("[memberCardBackgrounds] Unsplash API failed, using static collection URLs", e);
        }
      }
      cachedPool = FALLBACK_BACKGROUNDS;
      return cachedPool;
    })().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

export async function pickRandomMemberCardBackground(): Promise<MemberCardBackground | null> {
  const pool = await loadMemberCardBackgroundPool();
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)]!;
}
