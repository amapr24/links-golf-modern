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
  const markersRef = useRef<google.maps.Marker[]>([]);
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

  // Create tooltip content for marker
  const createTooltipContent = (course: CourseCoordinate): string => {
    return `
      <div style="
        background: white;
        padding: 8px 12px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        font-family: 'Outfit', sans-serif;
        max-width: 200px;
      ">
        <div style="font-weight: 600; font-size: 13px; color: #1a1a1a; margin-bottom: 4px;">
          ${course.name}
        </div>
        <div style="font-size: 12px; color: #666; margin-bottom: 6px;">
          ${course.location}
        </div>
        <div style="font-size: 12px; font-weight: 600; color: #2d7a4a;">
          ${course.discount}% discount
        </div>
      </div>
    `;
  };

  // Classic markers (no mapId / AdvancedMarker setup required for Forge keys)
  const createMarker = (
    map: google.maps.Map,
    course: CourseCoordinate,
    isSelected: boolean
  ) => {
    const markerColor = course.tier === "resort" ? "#2d7a4a" : "#4a9d6f";
    const selectedColor = "#1a4d2e";
    const color = isSelected ? selectedColor : markerColor;

    const marker = new google.maps.Marker({
      map,
      position: { lat: course.lat, lng: course.lng },
      title: course.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
        scale: isSelected ? 10 : 8,
      },
    });

    // Create info window for hover tooltip
    const infoWindow = new google.maps.InfoWindow({
      content: createTooltipContent(course),
      disableAutoPan: true,
    });

    // Show tooltip on hover
    marker.addListener("mouseover", () => {
      infoWindow.open(map, marker);
    });

    // Hide tooltip on mouse out
    marker.addListener("mouseout", () => {
      infoWindow.close();
    });

    // Select course on click
    marker.addListener("click", () => {
      setSelectedCourse(course);
    });

    return marker;
  };

  // Initialize map and add markers
  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;

    markersRef.current.forEach((marker) => marker.setMap(null));
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

    markersRef.current.forEach((marker) => marker.setMap(null));
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
