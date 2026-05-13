/**
 * CoursesMap — Interactive Google Map showing partner golf courses in Puerto Rico
 * Displays course pins with filtering by directory course type.
 * Pin hover: immediate custom label showing only course name.
 * Course pills always visible — no popup detail card.
 */

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { ChevronsDown, MapPin } from "lucide-react";
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

/** Holes data from the full directory — keyed by slug */
const COURSE_HOLES: Record<string, number> = {
  tpc_dorado_beach: 72,
  bahia_beach: 18,
  el_conquistador: 18,
  el_legado: 18,
  dorado_del_mar: 18,
  palmas_del_mar: 36,
  royal_isabela: 18,
  wyndham_rio_mar: 36,
  caguas_real: 18,
  club_deportivo_oeste: 18,
  coco_beach: 36,
  costa_caribe: 27,
  fort_buchanan: 9,
  punta_borinquen: 18,
  rio_bayamon: 18,
};

const discountColor = (d: number) => {
  if (d >= 25) return { bg: "oklch(0.42 0.14 145)", text: "white" };
  if (d >= 20) return { bg: "oklch(0.35 0.12 145)", text: "white" };
  return { bg: "oklch(0.92 0.04 145)", text: "oklch(0.28 0.12 145)" };
};

/** Teardrop pin (SVG) — reads as "map pin" / fairway marker vs plain circle */
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
  const pillRefs = useRef<Partial<Record<string, HTMLButtonElement>>>({});
  const listUlRef = useRef<HTMLUListElement>(null);
  const [listScrollable, setListScrollable] = useState(false);
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

  useEffect(() => {
    setSelectedCourse((prev) =>
      prev && filteredCourses.some((c) => c.slug === prev.slug) ? prev : null,
    );
  }, [filter, filteredCourses]);

  useEffect(() => {
    if (!selectedCourse) return;
    const el = pillRefs.current[selectedCourse.slug];
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedCourse?.slug]);

  const updateListScrollable = useCallback(() => {
    const el = listUlRef.current;
    if (!el) return;
    setListScrollable(el.scrollHeight > el.clientHeight + 2);
  }, []);

  useEffect(() => {
    const el = listUlRef.current;
    if (!el) return;
    updateListScrollable();
    const ro = new ResizeObserver(() => updateListScrollable());
    ro.observe(el);
    el.addEventListener("scroll", updateListScrollable, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", updateListScrollable);
    };
  }, [filteredCourses, updateListScrollable]);

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
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
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
      mapRef.current.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
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

  const onCoursePillClick = usePersistFn((course: CourseCoordinate) => {
    setSelectedCourse(course);
    mapRef.current?.panTo({ lat: course.lat, lng: course.lng });
  });

  const hoverTitle = hoverTip
    ? partnerCourseName(hoverTip.course.slug, hoverTip.course.name, language, t)
    : "";

  return (
    /* Mobile: add horizontal padding so section doesn't span full width */
    <div className="w-full min-w-0 max-w-full px-4 min-[900px]:px-0">
      {/* Grid: wider rectangular map + course list side panel */}
      <div
        className="grid w-full min-w-0 max-w-full grid-cols-1 gap-4 min-[900px]:grid-cols-[minmax(0,5fr)_minmax(240px,2fr)] min-[900px]:grid-rows-[minmax(0,380px)] min-[900px]:gap-6 min-[900px]:items-stretch min-[900px]:h-[380px] min-[900px]:max-h-[380px] min-[900px]:min-h-0 min-[900px]:overflow-hidden"
        role="presentation"
      >
        {/* Map — wider, shorter rectangle to echo Puerto Rico's shape */}
        <div className="relative min-h-0 min-w-0 h-[min(55vh,22rem)] min-[640px]:max-[899px]:h-[340px] min-[900px]:h-[380px] min-[900px]:min-h-0 rounded-lg overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.06]">
          <MapView
            initialCenter={{ lat: 18.2208, lng: -66.5901 }}
            initialZoom={9}
            onMapReady={handleMapReady}
            className="w-full h-full"
          />
          {/* Hover tooltip — name only for minimal pin coverage */}
          {hoverTip && (
            <div
              className="pointer-events-none absolute z-[1000] rounded-md border border-black/10 bg-white px-3 py-1.5 shadow-lg"
              style={{
                left: hoverTip.x,
                top: hoverTip.y,
                transform: "translate(-50%, calc(-100% - 14px))",
                boxShadow: "0 6px 24px rgba(0,0,0,0.14)",
              }}
              role="status"
              aria-live="polite"
              aria-label={hoverTitle}
            >
              <div
                className="text-sm font-semibold leading-snug whitespace-nowrap"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: "oklch(0.16 0.04 145)",
                }}
              >
                {hoverTitle}
              </div>
            </div>
          )}
        </div>

        {/* Course list panel — narrower pills */}
        <div className="relative flex min-h-0 min-w-0 flex-col mt-1 min-[900px]:mt-0 min-[900px]:h-full min-[900px]:min-h-0 min-[900px]:overflow-hidden">
          <ul
            ref={listUlRef}
            className="m-0 flex min-h-0 list-none flex-col gap-2 overflow-y-auto overscroll-contain p-0 pb-8 pr-1 max-h-[360px] max-[899px]:shrink-0 min-[900px]:max-h-full min-[900px]:min-h-0 min-[900px]:flex-1 min-[900px]:pr-1 [scrollbar-width:thin] [scrollbar-color:oklch(0.55_0.06_145/0.35)_oklch(0.92_0.02_85/0.5)] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/25 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-black/[0.06]"
            style={{ WebkitOverflowScrolling: "touch" }}
            aria-label={t("courses.mapListRegion")}
          >
            {filteredCourses.map((course) => {
              const colors = discountColor(course.discount);
              const displayName = partnerCourseName(course.slug, course.name, language, t);
              const selected = course === selectedCourse;
              const holes = COURSE_HOLES[course.slug];
              return (
                <li key={course.slug} className="shrink-0">
                  <button
                    type="button"
                    aria-pressed={selected}
                    ref={(el) => {
                      if (el) pillRefs.current[course.slug] = el;
                      else delete pillRefs.current[course.slug];
                    }}
                    onClick={() => onCoursePillClick(course)}
                    className="course-map-pill flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors duration-200 touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.42_0.14_145)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F3EC]"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      background: selected ? "oklch(0.97 0.03 145)" : "white",
                      borderColor: selected ? "oklch(0.42 0.14 145)" : "oklch(0.88 0.02 85)",
                      boxShadow: selected
                        ? "0 0 0 1px oklch(0.42 0.14 145)"
                        : "0 1px 0 rgba(0,0,0,0.04)",
                      color: "oklch(0.13 0.05 145)",
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{displayName}</div>
                      <div
                        className="mt-0.5 flex items-center gap-1.5 text-xs flex-wrap"
                        style={{ color: "oklch(0.55 0.06 145)" }}
                      >
                        <span className="inline-flex items-center gap-0.5">
                          <MapPin size={10} aria-hidden />
                          {course.location}
                        </span>
                        {/* Desktop: show holes count (type removed — filters handle that) */}
                        {holes && (
                          <>
                            <span className="hidden min-[900px]:inline">·</span>
                            <span className="hidden min-[900px]:inline">
                              {holes} {t("courses.holes") || "holes"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Discount badge — smaller and less prominent */}
                    <div
                      className="flex h-7 shrink-0 items-center justify-center rounded-full px-2.5"
                      style={{ background: colors.bg, opacity: 0.85 }}
                    >
                      <span
                        className="font-semibold leading-none"
                        style={{ color: colors.text, fontSize: "0.75rem" }}
                      >
                        {course.discount}% {t("courses.discountOff")}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Scroll indicator — carats just above bottom edge of pill list, no faded bar */}
          {listScrollable && (
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-1 z-10 flex justify-center pb-1"
              aria-hidden
            >
              <div
                className="flex items-center gap-1.5 px-2 py-0.5"
                style={{ background: "transparent" }}
              >
                <ChevronsDown
                  size={14}
                  strokeWidth={2.5}
                  style={{ color: "oklch(0.42 0.14 145)" }}
                  aria-hidden
                />
                <p
                  className="m-0 text-[10px] font-medium leading-snug"
                  style={{ color: "oklch(0.45 0.06 145)", fontFamily: "'Outfit', sans-serif" }}
                >
                  {t("courses.mapListScrollHint")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Course count info */}
      <p
        className="mt-4 text-sm md:text-base text-center min-[900px]:text-left leading-relaxed"
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
