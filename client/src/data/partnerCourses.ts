export type CourseTier = "resort" | "club";

export interface PartnerCourse {
  name: string;
  location: string;
  discount: number;
  tier: CourseTier;
}

/** Single source of truth for home + courses UI counts and listings */
export const partnerCourses: PartnerCourse[] = [
  { name: "TPC Dorado Beach", location: "Dorado", discount: 25, tier: "resort" },
  { name: "Royal Isabela", location: "Isabela", discount: 20, tier: "resort" },
  { name: "Bahia Beach", location: "Rio Grande", discount: 20, tier: "resort" },
  { name: "Wyndham Rio Mar", location: "Rio Grande", discount: 20, tier: "resort" },
  { name: "El Conquistador", location: "Las Croabas", discount: 20, tier: "resort" },
  { name: "Dorado del Mar", location: "Dorado", discount: 20, tier: "resort" },
  { name: "El Legado", location: "Guayama", discount: 20, tier: "resort" },
  { name: "Palmas del Mar", location: "Humacao", discount: 20, tier: "resort" },
  { name: "Caguas Real", location: "Caguas", discount: 15, tier: "club" },
  { name: "Coco Beach", location: "Rio Grande", discount: 15, tier: "club" },
  { name: "Club Deportivo del Oeste", location: "Cabo Rojo", discount: 15, tier: "club" },
  { name: "Fort Buchanan", location: "Guaynabo", discount: 15, tier: "club" },
  { name: "Rio Bayamon", location: "Bayamón", discount: 15, tier: "club" },
  { name: "Punta Borinquen", location: "Aguadilla", discount: 15, tier: "club" },
  { name: "Costa Caribe", location: "Ponce", discount: 15, tier: "club" },
];

export const PARTNER_COURSE_COUNT = partnerCourses.length;

export const MAX_PARTNER_DISCOUNT = Math.max(...partnerCourses.map((c) => c.discount));
