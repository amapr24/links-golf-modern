/**
 * Course coordinates for Puerto Rico golf courses
 * Used for interactive map display in CoursesSection
 * `slug` matches `partnerCourses` for localized labels.
 */

export interface CourseCoordinate {
  slug: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  tier: "resort" | "club";
  discount: number;
}

export const courseCoordinates: CourseCoordinate[] = [
  {
    slug: "tpc_dorado_beach",
    name: "TPC Dorado Beach",
    location: "Dorado",
    lat: 18.4606,
    lng: -66.2658,
    tier: "resort",
    discount: 25,
  },
  {
    slug: "royal_isabela",
    name: "Royal Isabela",
    location: "Isabela",
    lat: 18.4833,
    lng: -67.0667,
    tier: "resort",
    discount: 20,
  },
  {
    slug: "bahia_beach",
    name: "Bahia Beach",
    location: "Rio Grande",
    lat: 18.40884,
    lng: -65.81621,
    tier: "resort",
    discount: 20,
  },
  {
    slug: "wyndham_rio_mar",
    name: "Wyndham Rio Mar",
    location: "Rio Grande",
    lat: 18.38265,
    lng: -65.75967,
    tier: "resort",
    discount: 20,
  },
  {
    slug: "el_conquistador",
    name: "El Conquistador",
    location: "Las Croabas",
    lat: 18.35504,
    lng: -65.6298,
    tier: "resort",
    discount: 20,
  },
  {
    slug: "dorado_del_mar",
    name: "Dorado del Mar",
    location: "Dorado",
    lat: 18.4556,
    lng: -66.2722,
    tier: "resort",
    discount: 20,
  },
  {
    slug: "el_legado",
    name: "El Legado",
    location: "Guayama",
    lat: 17.9667,
    lng: -66.1167,
    tier: "resort",
    discount: 20,
  },
  {
    slug: "palmas_del_mar",
    name: "Palmas del Mar",
    location: "Humacao",
    lat: 18.2333,
    lng: -65.8167,
    tier: "resort",
    discount: 20,
  },
  {
    slug: "caguas_real",
    name: "Caguas Real",
    location: "Caguas",
    lat: 18.19367,
    lng: -66.05013,
    tier: "club",
    discount: 15,
  },
  {
    slug: "coco_beach",
    name: "Coco Beach",
    location: "Rio Grande",
    lat: 18.40417,
    lng: -65.79694,
    tier: "club",
    discount: 15,
  },
  {
    slug: "club_deportivo_oeste",
    name: "Club Deportivo del Oeste",
    location: "Cabo Rojo",
    lat: 18.0944,
    lng: -67.2,
    tier: "club",
    discount: 15,
  },
  {
    slug: "fort_buchanan",
    name: "Fort Buchanan",
    location: "Guaynabo",
    lat: 18.3667,
    lng: -66.1167,
    tier: "club",
    discount: 15,
  },
  {
    slug: "rio_bayamon",
    name: "Rio Bayamon",
    location: "Bayamón",
    lat: 18.3833,
    lng: -66.1667,
    tier: "club",
    discount: 15,
  },
  {
    slug: "punta_borinquen",
    name: "Punta Borinquen",
    location: "Aguadilla",
    lat: 18.4833,
    lng: -67.1167,
    tier: "club",
    discount: 15,
  },
  {
    slug: "costa_caribe",
    name: "Costa Caribe",
    location: "Ponce",
    lat: 17.9833,
    lng: -66.6167,
    tier: "club",
    discount: 15,
  },
];
