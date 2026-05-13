/**
 * CoursesMap — Interactive Google Map showing partner golf courses in Puerto Rico
 * Displays course pins with filtering by tier (resort/club)
 */

import { useRef, useEffect, useState } from "react";
import { MapView } from "./Map";
import { courseCoordinates, type CourseCoordinate } from "@/data/courseCoordinates";
import { useLanguage } from "@/contexts/LanguageContext";

interface CoursesMapProps {
  filter: "all" | "resort" | "club";
}

export function CoursesMap({ filter }: CoursesMapProps) {
  const { t } = useLanguage();
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseCoordinate | null>(null);

  // Filter courses based on tier
  const filteredCourses = courseCoordinates.filter(
    (c) => filter === "all" || c.tier === filter
  );

  // Calculate map bounds to fit all filtered courses
  const calculateBounds = (courses: CourseCoordinate[]) => {
    if (courses.length === 0) return null;

    const bounds = new google.maps.LatLngBounds();
    courses.forEach((course) => {
      bounds.extend({ lat: course.lat, lng: course.lng });
    });
    return bounds;
  };

  // Create marker for a course
  const createMarker = (
    map: google.maps.Map,
    course: CourseCoordinate,
    isSelected: boolean
  ) => {
    const markerColor = course.tier === "resort" ? "#2d7a4a" : "#4a9d6f";
    const selectedColor = "#1a4d2e";

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: { lat: course.lat, lng: course.lng },
      title: course.name,
      content: createMarkerContent(course, isSelected ? selectedColor : markerColor),
    });

    // Add click listener to select course
    marker.addListener("click", () => {
      setSelectedCourse(course);
    });

    return marker;
  };

  // Create custom marker HTML content
  const createMarkerContent = (course: CourseCoordinate, color: string) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        cursor: pointer;
        transition: all 0.2s ease;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
        </svg>
      </div>
    `;
    return div;
  };

  // Initialize map and add markers
  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.map = null);
    markersRef.current = [];

    // Add markers for filtered courses
    filteredCourses.forEach((course) => {
      const marker = createMarker(map, course, false);
      markersRef.current.push(marker);
    });

    // Fit bounds to all markers
    const bounds = calculateBounds(filteredCourses);
    if (bounds) {
      map.fitBounds(bounds, { top: 100, right: 100, bottom: 100, left: 100 });
    }
  };

  // Update markers when filter changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.map = null);
    markersRef.current = [];

    // Add new markers for filtered courses
    filteredCourses.forEach((course) => {
      const marker = createMarker(mapRef.current!, course, course === selectedCourse);
      markersRef.current.push(marker);
    });

    // Fit bounds to all markers
    const bounds = calculateBounds(filteredCourses);
    if (bounds) {
      mapRef.current.fitBounds(bounds, { top: 100, right: 100, bottom: 100, left: 100 });
    }
  }, [filter, selectedCourse]);

  return (
    <div className="w-full">
      {/* Map Container */}
      <div className="relative w-full h-[500px] md:h-[600px] rounded-lg overflow-hidden">
        <MapView
          initialCenter={{ lat: 18.2208, lng: -66.5901 }} // Center of Puerto Rico
          initialZoom={9}
          onMapReady={handleMapReady}
          className="w-full h-full"
        />
      </div>

      {/* Selected Course Info Card */}
      {selectedCourse && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{selectedCourse.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{selectedCourse.location}</p>
              <div className="flex items-center gap-4">
                <span
                  className="inline-block px-2 py-1 text-xs font-semibold rounded"
                  style={{
                    background:
                      selectedCourse.tier === "resort"
                        ? "oklch(0.42 0.14 145)"
                        : "oklch(0.92 0.04 145)",
                    color:
                      selectedCourse.tier === "resort"
                        ? "white"
                        : "oklch(0.28 0.12 145)",
                  }}
                >
                  {selectedCourse.tier === "resort"
                    ? t("courses.filter.resort")
                    : t("courses.filter.club")}
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "oklch(0.42 0.14 145)" }}
                >
                  {selectedCourse.discount}% {t("courses.discount")}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedCourse(null)}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Course Count Info */}
      <p className="mt-4 text-sm text-gray-600 text-center">
        {t("courses.mapInfo", { count: filteredCourses.length })}
      </p>
    </div>
  );
}
