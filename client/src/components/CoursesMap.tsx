/**
 * CoursesMap — Interactive Google Map showing partner golf courses in Puerto Rico
 * Displays course pins with filtering by directory course type.
 * Pin hover: immediate custom label (no slow native `title` tooltip). Click opens detail card below.
 */

import { useRef, useEffect, useState, useMemo } from "react";
import { X } from "lucide-react";
import { MapView } from "./Map";
import { courseCoordinates, type CourseCoordinate } from "@/data/courseCoordinates";
import type { PartnerCourseType } from "@/data/partnerCourses";
import { useLanguage } from "@/contexts/LanguageContext";
import { partnerCourseName } from "@/lib/partnerCourseName";
import { usePersistFn } from "@/hooks/usePersistFn";

type CoursesMapFilter = "all" | PartnerCourseType;

interface CoursesMapProps {
  filter: CoursesMapFilter;
}

/** Teardrop pin (SVG) — reads as “map pin” / fairway marker vs plain circle */
function golfPinIcon(fill: string, selected: boolean): google.maps.Icon {
  const w = selected ? 36 : 30;
  const h = selected ? 46 : 38;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 30 38"><path d="M15 2C8.4 2 3.5 6.8 3.5 12.8c0 7.4 11.5 19.2 11.5 23.2 0-4 11.5-15.8 11.5-23.2C26.5 6.8 21.6 2 15 2z" fill="${fill}" stroke="#ffffff" stroke-width="1.3"/><circle cx="15" cy="12.8" r="2.8" fill="#ffffff" fill-opacity="0.95"/></svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(w, h),
    anchor: new google.maps.Point(w / 2, h - 2),
  };
}

export function CoursesMap({ filter }: CoursesMapProps) {
  const { t, language } = useLanguage();
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const overlayRef = useRef<google.maps.OverlayView | null>(null);
  const hoverLatLngRef = useRef<google.maps.LatLng | null>(null);
  const mapListenersRef = useRef<google.maps.MapsEventListener[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseCoordinate | null>(null);
  const [hoverTip, setHoverTip] = useState<{
    course: CourseCoordinate;
    x: number;
    y: number;
  } | null>(null);

  const filteredCourses = useMemo(
    () => courseCoordinates.filter((c) => filter === "all" || c.courseType === filter),
    [filter],
  );

  const calculateBounds = (courses: CourseCoordinate[]) => {
    if (courses.length === 0) return null;
    const bounds = new google.maps.LatLngBounds();
    courses.forEach((course) => {
      bounds.extend({ lat: course.lat, lng: course.lng });
    });
    return bounds;
  };

  const repositionHoverTip = usePersistFn(() => {
    const ll = hoverLatLngRef.current;
    const ov = overlayRef.current;
    if (!ll || !ov) return;
    const proj = ov.getProjection();
    if (!proj) return;
    const pt = proj.fromLatLngToContainerPixel(ll);
    if (!pt) return;
    setHoverTip((h) => (h ? { ...h, x: pt.x, y: pt.y } : null));
  });

  const attachMapListeners = usePersistFn((map: google.maps.Map) => {
    mapListenersRef.current.forEach((l) => l.remove());
    mapListenersRef.current = [];
    mapListenersRef.current.push(
      map.addListener("idle", repositionHoverTip),
      map.addListener("zoom_changed", repositionHoverTip),
      map.addListener("dragend", repositionHoverTip),
    );
  });

  const ensureProjectionOverlay = usePersistFn((map: google.maps.Map) => {
    if (overlayRef.current) {
      overlayRef.current.setMap(null);
    }
    const overlay = new google.maps.OverlayView();
    overlay.onAdd = () => {};
    overlay.draw = () => {};
    overlay.onRemove = () => {};
    overlay.setMap(map);
    overlayRef.current = overlay;
  });

  const createMarker = usePersistFn(
    (map: google.maps.Map, course: CourseCoordinate, isSelected: boolean) => {
      const markerColor = course.tier === "resort" ? "#2d7a4a" : "#4a9d6f";
      const selectedColor = "#1a4d2e";
      const color = isSelected ? selectedColor : markerColor;

      const marker = new google.maps.Marker({
        map,
        position: { lat: course.lat, lng: course.lng },
        icon: golfPinIcon(color, isSelected),
        optimized: true,
      });

      marker.addListener("click", () => {
        setSelectedCourse(course);
      });

      marker.addListener("mouseover", () => {
        const pos = marker.getPosition();
        hoverLatLngRef.current = pos ?? null;
        if (!pos) return;

        const proj = overlayRef.current?.getProjection();
        let x = 0;
        let y = 0;
        if (proj) {
          const pt = proj.fromLatLngToContainerPixel(pos);
          if (pt) {
            x = pt.x;
            y = pt.y;
          }
        }
        setHoverTip({ course, x, y });
        requestAnimationFrame(() => repositionHoverTip());
      });

      marker.addListener("mouseout", () => {
        const pos = marker.getPosition();
        if (pos && hoverLatLngRef.current?.equals(pos)) {
          hoverLatLngRef.current = null;
          setHoverTip(null);
        }
      });

      return marker;
    },
  );

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    ensureProjectionOverlay(map);
    attachMapListeners(map);

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
  }, [filter, selectedCourse, language, t, createMarker, filteredCourses]);

  useEffect(() => {
    return () => {
      mapListenersRef.current.forEach((l) => l.remove());
      mapListenersRef.current = [];
      overlayRef.current?.setMap(null);
      overlayRef.current = null;
      hoverLatLngRef.current = null;
    };
  }, []);

  const hoverTitle = hoverTip
    ? partnerCourseName(hoverTip.course.slug, hoverTip.course.name, language, t)
    : "";

  return (
    <div className="w-full">
      <div className="relative w-full h-[min(68vh,26rem)] sm:h-[500px] md:h-[600px] rounded-lg overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.06]">
        <MapView
          initialCenter={{ lat: 18.2208, lng: -66.5901 }}
          initialZoom={9}
          onMapReady={handleMapReady}
          className="w-full h-full"
        />
        {hoverTip && (
          <div
            className="pointer-events-none absolute z-[1000] max-w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-black/10 bg-white px-3.5 py-2.5 shadow-lg"
            style={{
              left: hoverTip.x,
              top: hoverTip.y,
              transform: "translate(-50%, calc(-100% - 14px))",
              boxShadow: "0 10px 40px rgba(0,0,0,0.18)",
            }}
            role="status"
            aria-live="polite"
            aria-label={hoverTitle}
          >
            <div
              className="text-base font-semibold leading-snug text-balance"
              style={{
                fontFamily: "'Outfit', sans-serif",
                color: "oklch(0.16 0.04 145)",
              }}
            >
              {hoverTitle}
            </div>
            <div
              className="mt-1 text-sm font-medium leading-snug"
              style={{
                fontFamily: "'Outfit', sans-serif",
                color: "oklch(0.32 0.06 145)",
              }}
            >
              {hoverTip.course.location}
              <span style={{ color: "oklch(0.45 0.05 145)" }}>
                {" "}
                · {hoverTip.course.discount}% {t("courses.discount")}
              </span>
            </div>
          </div>
        )}
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
              className="shrink-0 min-h-11 min-w-11 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition touch-manipulation"
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
