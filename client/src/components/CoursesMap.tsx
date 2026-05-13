/**
 * CoursesMap — Interactive Google Map showing partner golf courses in Puerto Rico
 * Displays course pins with filtering by tier (resort/club).
 * Pin hover: native title (no InfoWindow chrome). Click opens detail card below.
 */

import { useRef, useEffect, useState } from "react";
import { X } from "lucide-react";
import { MapView } from "./Map";
import { courseCoordinates, type CourseCoordinate } from "@/data/courseCoordinates";
import { useLanguage } from "@/contexts/LanguageContext";
import { partnerCourseName } from "@/lib/partnerCourseName";

interface CoursesMapProps {
  filter: "all" | "resort" | "club";
}

export function CoursesMap({ filter }: CoursesMapProps) {
  const { t, language } = useLanguage();
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseCoordinate | null>(null);

  const filteredCourses = courseCoordinates.filter(
    (c) => filter === "all" || c.tier === filter,
  );

  const calculateBounds = (courses: CourseCoordinate[]) => {
    if (courses.length === 0) return null;
    const bounds = new google.maps.LatLngBounds();
    courses.forEach((course) => {
      bounds.extend({ lat: course.lat, lng: course.lng });
    });
    return bounds;
  };

  const createMarker = (
    map: google.maps.Map,
    course: CourseCoordinate,
    isSelected: boolean,
  ) => {
    const markerColor = course.tier === "resort" ? "#2d7a4a" : "#4a9d6f";
    const selectedColor = "#1a4d2e";
    const color = isSelected ? selectedColor : markerColor;

    const label = partnerCourseName(course.slug, course.name, language, t);
    const marker = new google.maps.Marker({
      map,
      position: { lat: course.lat, lng: course.lng },
      title: `${label} — ${course.location} · ${course.discount}% ${t("courses.discount")}`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
        scale: isSelected ? 12 : 10,
      },
    });

    marker.addListener("click", () => {
      setSelectedCourse(course);
    });

    return marker;
  };

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    filteredCourses.forEach((course) => {
      const marker = createMarker(map, course, false);
      markersRef.current.push(marker);
    });

    const bounds = calculateBounds(filteredCourses);
    if (bounds) {
      map.fitBounds(bounds, { top: 100, right: 100, bottom: 100, left: 100 });
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    filteredCourses.forEach((course) => {
      const marker = createMarker(mapRef.current!, course, course === selectedCourse);
      markersRef.current.push(marker);
    });

    const bounds = calculateBounds(filteredCourses);
    if (bounds) {
      mapRef.current.fitBounds(bounds, { top: 100, right: 100, bottom: 100, left: 100 });
    }
  }, [filter, selectedCourse, t, language]);

  return (
    <div className="w-full">
      <div className="relative w-full h-[500px] md:h-[600px] rounded-lg overflow-hidden">
        <MapView
          initialCenter={{ lat: 18.2208, lng: -66.5901 }}
          initialZoom={9}
          onMapReady={handleMapReady}
          className="w-full h-full"
        />
      </div>

      {selectedCourse && (
        <div
          className="mt-4 max-w-lg mx-auto md:mx-0 p-5 md:p-6 bg-white rounded-lg border shadow-sm"
          style={{ borderColor: "oklch(0.88 0.02 85)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <h3
              className="text-lg md:text-xl font-semibold leading-snug text-balance pr-2 flex-1 min-w-0"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: "oklch(0.13 0.05 145)",
              }}
            >
              {partnerCourseName(
                selectedCourse.slug,
                selectedCourse.name,
                language,
                t,
              )}
            </h3>
            <button
              type="button"
              onClick={() => setSelectedCourse(null)}
              className="shrink-0 rounded-md p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition"
              aria-label={t("courses.mapCloseDetail")}
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>
          <p
            className="mt-2 text-base leading-relaxed"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color: "oklch(0.35 0.06 145)",
            }}
          >
            {selectedCourse.location}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span
              className="inline-block px-2.5 py-1 text-sm font-semibold rounded-sm"
              style={{
                background:
                  selectedCourse.tier === "resort"
                    ? "oklch(0.42 0.14 145)"
                    : "oklch(0.92 0.04 145)",
                color:
                  selectedCourse.tier === "resort"
                    ? "white"
                    : "oklch(0.28 0.12 145)",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {selectedCourse.tier === "resort"
                ? t("courses.filter.resort")
                : t("courses.filter.club")}
            </span>
            <span
              className="text-base font-semibold"
              style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
            >
              {selectedCourse.discount}% {t("courses.discount")}
            </span>
          </div>
        </div>
      )}

      <p
        className="mt-4 text-sm md:text-base text-center leading-relaxed"
        style={{
          fontFamily: "'Outfit', sans-serif",
          color: "oklch(0.45 0.06 145)",
        }}
      >
        {t("courses.mapInfo", { count: filteredCourses.length })}
      </p>
    </div>
  );
}
