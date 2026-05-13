export type CourseTier = "resort" | "club";

/** Matches full directory [`Courses.tsx`](../pages/Courses.tsx) course `type` values */
export type PartnerCourseType = "Resort" | "Semi-Private" | "Public" | "Country Club";

export interface PartnerCourse {
  /** Stable key for `courses.partner.{slug}` (Spanish display names). */
  slug: string;
  name: string;
  location: string;
  discount: number;
  tier: CourseTier;
  /** Directory course type (filters on Home align with full course directory). */
  courseType: PartnerCourseType;
}

/** Single source of truth for home + courses UI counts and listings */
export const partnerCourses: PartnerCourse[] = [
  { slug: "tpc_dorado_beach", name: "TPC Dorado Beach", location: "Dorado", discount: 25, tier: "resort", courseType: "Resort" },
  { slug: "royal_isabela", name: "Royal Isabela", location: "Isabela", discount: 20, tier: "resort", courseType: "Resort" },
  { slug: "bahia_beach", name: "Bahia Beach", location: "Rio Grande", discount: 20, tier: "resort", courseType: "Resort" },
  { slug: "wyndham_rio_mar", name: "Wyndham Rio Mar", location: "Rio Grande", discount: 20, tier: "resort", courseType: "Resort" },
  { slug: "el_conquistador", name: "El Conquistador", location: "Las Croabas", discount: 20, tier: "resort", courseType: "Resort" },
  { slug: "dorado_del_mar", name: "Dorado del Mar", location: "Dorado", discount: 20, tier: "resort", courseType: "Resort" },
  { slug: "el_legado", name: "El Legado", location: "Guayama", discount: 20, tier: "resort", courseType: "Resort" },
  { slug: "palmas_del_mar", name: "Palmas del Mar", location: "Humacao", discount: 20, tier: "resort", courseType: "Country Club" },
  { slug: "caguas_real", name: "Caguas Real", location: "Caguas", discount: 15, tier: "club", courseType: "Semi-Private" },
  { slug: "coco_beach", name: "Coco Beach", location: "Rio Grande", discount: 15, tier: "club", courseType: "Semi-Private" },
  { slug: "club_deportivo_oeste", name: "Club Deportivo del Oeste", location: "Cabo Rojo", discount: 15, tier: "club", courseType: "Public" },
  { slug: "fort_buchanan", name: "Fort Buchanan", location: "Guaynabo", discount: 15, tier: "club", courseType: "Public" },
  { slug: "rio_bayamon", name: "Rio Bayamon", location: "Bayamón", discount: 15, tier: "club", courseType: "Public" },
  { slug: "punta_borinquen", name: "Punta Borinquen", location: "Aguadilla", discount: 15, tier: "club", courseType: "Semi-Private" },
  { slug: "costa_caribe", name: "Costa Caribe", location: "Ponce", discount: 15, tier: "club", courseType: "Semi-Private" },
];

export const PARTNER_COURSE_COUNT = partnerCourses.length;

export const MAX_PARTNER_DISCOUNT = Math.max(...partnerCourses.map((c) => c.discount));
