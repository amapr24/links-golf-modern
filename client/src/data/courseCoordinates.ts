/**
 * Course coordinates for Puerto Rico golf courses
 * Used for interactive map display in CoursesSection
 * `slug` matches `partnerCourses` for localized labels.
 */

import type { PartnerCourseType } from "./partnerCourses";

export interface CourseCoordinate {
  slug: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  tier: "resort" | "club";
  discount: number;
  courseType: PartnerCourseType;
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
    courseType: "Resort",
  },
  {
    slug: "royal_isabela",
    name: "Royal Isabela",
    location: "Isabela",
    lat: 18.4833,
    lng: -67.0667,
    tier: "resort",
    discount: 20,
    courseType: "Resort",
  },
  {
    slug: "bahia_beach",
    name: "Bahia Beach",
    location: "Rio Grande",
    lat: 18.40884,
    lng: -65.81621,
    tier: "resort",
    discount: 20,
    courseType: "Resort",
  },
  {
    slug: "wyndham_rio_mar",
    name: "Wyndham Rio Mar",
    location: "Rio Grande",
    lat: 18.38265,
    lng: -65.75967,
    tier: "resort",
    discount: 20,
    courseType: "Resort",
  },
  {
    slug: "el_conquistador",
    name: "El Conquistador",
    location: "Las Croabas",
    lat: 18.35504,
    lng: -65.6298,
    tier: "resort",
    discount: 20,
    courseType: "Resort",
  },
  {
    slug: "dorado_del_mar",
    name: "Dorado del Mar",
    location: "Dorado",
    lat: 18.4556,
    lng: -66.2722,
    tier: "resort",
    discount: 20,
    courseType: "Resort",
  },
  {
    slug: "el_legado",
    name: "El Legado",
    location: "Guayama",
    lat: 17.98697,
    lng: -66.18371,
    tier: "resort",
    discount: 20,
    courseType: "Resort",
  },
  {
    slug: "palmas_del_mar",
    name: "Palmas del Mar",
    location: "Humacao",
    lat: 18.2333,
    lng: -65.8167,
    tier: "resort",
    discount: 20,
    courseType: "Country Club",
  },
  {
    slug: "caguas_real",
    name: "Caguas Real",
    location: "Caguas",
    lat: 18.19367,
    lng: -66.05013,
    tier: "club",
    discount: 15,
    courseType: "Semi-Private",
  },
  {
    slug: "coco_beach",
    name: "Coco Beach",
    location: "Rio Grande",
    lat: 18.40417,
    lng: -65.79694,
    tier: "club",
    discount: 15,
    courseType: "Semi-Private",
  },
  {
    slug: "club_deportivo_oeste",
    name: "Club Deportivo del Oeste",
    location: "Cabo Rojo",
    lat: 18.09911,
    lng: -67.18781,
    tier: "club",
    discount: 15,
    courseType: "Public",
  },
  {
    slug: "fort_buchanan",
    name: "Fort Buchanan",
    location: "Guaynabo",
    lat: 18.41297,
    lng: -66.11983,
    tier: "club",
    discount: 15,
    courseType: "Public",
  },
  {
    slug: "rio_bayamon",
    name: "Rio Bayamon",
    location: "Bayamón",
    lat: 18.37833,
    lng: -66.13722,
    tier: "club",
    discount: 15,
    courseType: "Public",
  },
  {
    slug: "punta_borinquen",
    name: "Punta Borinquen",
    location: "Aguadilla",
    lat: 18.4833,
    lng: -67.1167,
    tier: "club",
    discount: 15,
    courseType: "Semi-Private",
  },
  {
    slug: "costa_caribe",
    name: "Costa Caribe",
    location: "Ponce",
    lat: 17.9727,
    lng: -66.59408,
    tier: "club",
    discount: 15,
    courseType: "Semi-Private",
  },
];
