/*
 * Courses Directory — Links Golf Membership
 * Design: Full-page searchable, filterable, sortable course directory
 * Features: Search by name/location, filter by type, sort by columns
 */

import { useState, useMemo } from "react";
import { Search, ChevronUp, ChevronDown, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { partnerCourseName } from "@/lib/partnerCourseName";

interface Course {
  id: number;
  slug: string;
  name: string;
  municipio: string;
  type: "Resort" | "Semi-Private" | "Public" | "Country Club";
  holes: number;
  discount: number;
}

const COURSES: Course[] = [
  { id: 1, slug: "tpc_dorado_beach", name: "TPC Dorado Beach Resort & Club", municipio: "Dorado", type: "Resort", holes: 72, discount: 25 },
  { id: 2, slug: "bahia_beach", name: "Bahia Beach Resort & Golf Club", municipio: "Rio Grande", type: "Resort", holes: 18, discount: 20 },
  { id: 3, slug: "el_conquistador", name: "El Conquistador Resort", municipio: "Las Croabas", type: "Resort", holes: 18, discount: 20 },
  { id: 4, slug: "el_legado", name: "El Legado Golf Resort", municipio: "Guayama", type: "Resort", holes: 18, discount: 20 },
  { id: 5, slug: "dorado_del_mar", name: "Dorado del Mar Beach & Golf Resort", municipio: "Dorado", type: "Resort", holes: 18, discount: 20 },
  { id: 6, slug: "palmas_del_mar", name: "Palmas Del Mar Country Club", municipio: "Humacao", type: "Country Club", holes: 36, discount: 20 },
  { id: 7, slug: "royal_isabela", name: "Royal Isabela Golf Course", municipio: "Isabela", type: "Resort", holes: 18, discount: 20 },
  { id: 8, slug: "wyndham_rio_mar", name: "Wyndham Grand Rio Mar", municipio: "Rio Grande", type: "Resort", holes: 36, discount: 20 },
  { id: 9, slug: "caguas_real", name: "Caguas Real Golf & Country Club", municipio: "Caguas", type: "Semi-Private", holes: 18, discount: 15 },
  { id: 10, slug: "club_deportivo_oeste", name: "Club Deportivo del Oeste", municipio: "Cabo Rojo", type: "Public", holes: 18, discount: 15 },
  { id: 11, slug: "coco_beach", name: "Coco Beach Golf & Country Club", municipio: "Rio Grande", type: "Semi-Private", holes: 36, discount: 15 },
  { id: 12, slug: "costa_caribe", name: "Costa Caribe Golf Club", municipio: "Ponce", type: "Semi-Private", holes: 27, discount: 15 },
  { id: 13, slug: "fort_buchanan", name: "Fort Buchanan Golf Course", municipio: "Fort Buchanan", type: "Public", holes: 9, discount: 15 },
  { id: 14, slug: "punta_borinquen", name: "Punta Borinquen Golf Course", municipio: "Ramey Base", type: "Semi-Private", holes: 18, discount: 15 },
  { id: 15, slug: "rio_bayamon", name: "Rio Bayamon Golf Course", municipio: "Bayamon", type: "Public", holes: 18, discount: 15 },
];

type SortField = "name" | "municipio" | "type" | "holes" | "discount";
type SortDirection = "asc" | "desc";

export default function Courses() {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | Course["type"]>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const courseTypes: ("all" | Course["type"])[] = ["all", "Resort", "Semi-Private", "Public", "Country Club"];

  const courseRows = useMemo(
    () =>
      COURSES.map((c) => ({
        ...c,
        displayName: partnerCourseName(c.slug, c.name, language, t),
      })),
    [language, t],
  );

  const filtered = useMemo(() => {
    let result = courseRows;

    // Search filter
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.displayName.toLowerCase().includes(query) ||
          c.municipio.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter((c) => c.type === typeFilter);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let aVal: string | number =
        sortField === "name" ? a.displayName.toLowerCase() : a[sortField];
      let bVal: string | number =
        sortField === "name" ? b.displayName.toLowerCase() : b[sortField];

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [search, typeFilter, sortField, sortDirection, courseRows]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-white/20 text-xs">↕</span>;
    return sortDirection === "asc" ? (
      <ChevronUp size={14} className="text-white" />
    ) : (
      <ChevronDown size={14} className="text-white" />
    );
  };

  return (
    <div className="min-h-screen" style={{ background: "#F7F3EC" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "white",
          borderColor: "oklch(0.92 0.004 286.32)",
        }}
      >
        <div className="container flex items-center justify-between py-4">
          <a
            href="/"
            className="font-semibold text-sm flex items-center gap-2"
            style={{ fontFamily: "'Outfit', sans-serif", color: "oklch(0.13 0.05 145)" }}
          >
            ← Back to Home
          </a>
          <h1
            className="text-lg font-semibold"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "oklch(0.13 0.05 145)" }}
          >
            Course Directory
          </h1>
          <div style={{ width: "120px" }} />
        </div>
      </header>

      {/* Main content */}
      <main className="container py-12">
        {/* Heading */}
        <div className="mb-12">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
          >
            02 · {t("courses.label")}
          </p>
          <h2
            className="text-4xl md:text-5xl font-semibold mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "oklch(0.13 0.05 145)",
            }}
          >
            Fifteen courses,{" "}
            <em style={{ color: "oklch(0.42 0.14 145)", fontStyle: "italic" }}>
              one island.
            </em>
          </h2>
          <p
            className="text-sm max-w-2xl"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color: "oklch(0.55 0.06 145)",
              fontWeight: 300,
            }}
          >
            The full directory of partner courses. Show your Links Golf card at any location to unlock your member rate — from west-coast cliffs to southern shores.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-12">
          <div
            className="rounded-lg p-6"
            style={{
              background: "white",
              border: "1px solid oklch(0.88 0.02 85)",
            }}
          >
            <div
              className="text-2xl font-semibold"
              style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
            >
              15
            </div>
            <div
              className="text-xs uppercase tracking-widest mt-1"
              style={{ color: "oklch(0.55 0.06 145)", fontFamily: "'Outfit', sans-serif" }}
            >
              Courses
            </div>
          </div>
          <div
            className="rounded-lg p-6"
            style={{
              background: "white",
              border: "1px solid oklch(0.88 0.02 85)",
            }}
          >
            <div
              className="text-2xl font-semibold"
              style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
            >
              339
            </div>
            <div
              className="text-xs uppercase tracking-widest mt-1"
              style={{ color: "oklch(0.55 0.06 145)", fontFamily: "'Outfit', sans-serif" }}
            >
              Holes
            </div>
          </div>
          <div
            className="rounded-lg p-6"
            style={{
              background: "white",
              border: "1px solid oklch(0.88 0.02 85)",
            }}
          >
            <div
              className="text-2xl font-semibold"
              style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
            >
              15–25%
            </div>
            <div
              className="text-xs uppercase tracking-widest mt-1"
              style={{ color: "oklch(0.55 0.06 145)", fontFamily: "'Outfit', sans-serif" }}
            >
              Discount
            </div>
          </div>
          <div
            className="rounded-lg p-6 hidden md:block"
            style={{
              background: "white",
              border: "1px solid oklch(0.88 0.02 85)",
            }}
          >
            <div
              className="text-2xl font-semibold"
              style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
            >
              1
            </div>
            <div
              className="text-xs uppercase tracking-widest mt-1"
              style={{ color: "oklch(0.55 0.06 145)", fontFamily: "'Outfit', sans-serif" }}
            >
              Membership
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div
            className="relative rounded-lg overflow-hidden"
            style={{
              background: "white",
              border: "1px solid oklch(0.88 0.02 85)",
            }}
          >
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "oklch(0.55 0.06 145)" }}
            />
            <input
              type="text"
              placeholder="Search by name, town or type…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 outline-none"
              style={{
                fontFamily: "'Outfit', sans-serif",
                color: "oklch(0.13 0.05 145)",
              }}
            />
          </div>

          {/* Type filters */}
          <div className="flex flex-wrap gap-2">
            {courseTypes.map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className="px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all duration-200"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  background: typeFilter === type ? "oklch(0.42 0.14 145)" : "white",
                  color: typeFilter === type ? "white" : "oklch(0.55 0.06 145)",
                  border: `1px solid ${typeFilter === type ? "oklch(0.42 0.14 145)" : "oklch(0.88 0.02 85)"}`,
                }}
              >
                {type === "all" ? "All" : type}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div
          className="text-xs mb-4"
          style={{ color: "oklch(0.55 0.06 145)", fontFamily: "'Outfit', sans-serif" }}
        >
          Showing {filtered.length} of {COURSES.length} courses
        </div>

        {/* Table */}
        <div
          className="rounded-lg overflow-hidden shadow-sm"
          style={{
            background: "white",
            border: "1px solid oklch(0.88 0.02 85)",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "oklch(0.13 0.05 145)" }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: "white", fontFamily: "'Outfit', sans-serif", width: "5%" }}>
                    #
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ color: "white", fontFamily: "'Outfit', sans-serif" }}
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Course <SortIcon field="name" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ color: "white", fontFamily: "'Outfit', sans-serif" }}
                    onClick={() => handleSort("municipio")}
                  >
                    <div className="flex items-center gap-2">
                      Municipio <SortIcon field="municipio" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ color: "white", fontFamily: "'Outfit', sans-serif" }}
                    onClick={() => handleSort("type")}
                  >
                    <div className="flex items-center gap-2">
                      Type <SortIcon field="type" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ color: "white", fontFamily: "'Outfit', sans-serif" }}
                    onClick={() => handleSort("holes")}
                  >
                    <div className="flex items-center gap-2">
                      Holes <SortIcon field="holes" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ color: "white", fontFamily: "'Outfit', sans-serif" }}
                    onClick={() => handleSort("discount")}
                  >
                    <div className="flex items-center gap-2">
                      Discount <SortIcon field="discount" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((course, idx) => (
                  <tr
                    key={course.id}
                    style={{
                      borderBottom: "1px solid oklch(0.92 0.004 286.32)",
                      background: idx % 2 === 0 ? "white" : "oklch(0.98 0.001 286.375)",
                    }}
                  >
                    <td
                      className="px-4 py-4 text-sm"
                      style={{ color: "oklch(0.55 0.06 145)", fontFamily: "'Outfit', sans-serif" }}
                    >
                      {String(course.id).padStart(2, "0")}
                    </td>
                    <td
                      className="px-4 py-4 text-sm font-semibold"
                      style={{ color: "oklch(0.13 0.05 145)", fontFamily: "'Outfit', sans-serif" }}
                    >
                      {course.displayName}
                    </td>
                    <td
                      className="px-4 py-4 text-sm"
                      style={{ color: "oklch(0.55 0.06 145)", fontFamily: "'Outfit', sans-serif" }}
                    >
                      {course.municipio}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span
                        className="inline-block px-2.5 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider"
                        style={{
                          background: "oklch(0.42 0.14 145 / 0.1)",
                          color: "oklch(0.42 0.14 145)",
                          fontFamily: "'Outfit', sans-serif",
                        }}
                      >
                        {course.type}
                      </span>
                    </td>
                    <td
                      className="px-4 py-4 text-sm"
                      style={{ color: "oklch(0.55 0.06 145)", fontFamily: "'Outfit', sans-serif" }}
                    >
                      {course.holes}
                    </td>
                    <td
                      className="px-4 py-4 text-sm font-semibold"
                      style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
                    >
                      {course.discount}% OFF
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div
          className="rounded-lg p-8 mt-12 text-center"
          style={{
            background: "oklch(0.42 0.14 145 / 0.08)",
            border: "1px solid oklch(0.42 0.14 145 / 0.2)",
          }}
        >
          <h3
            className="text-2xl font-semibold mb-3"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "oklch(0.13 0.05 145)",
            }}
          >
            Ready to play <em style={{ fontStyle: "italic", color: "oklch(0.42 0.14 145)" }}>more, pay less?</em>
          </h3>
          <p
            className="text-sm mb-6"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color: "oklch(0.55 0.06 145)",
              fontWeight: 300,
            }}
          >
            One card. Fifteen courses. 365 days of better rates across Puerto Rico.
          </p>
          <a
            href="/#pricing"
            className="inline-block px-6 py-3 rounded-sm text-sm font-semibold transition-all duration-200"
            style={{
              background: "oklch(0.42 0.14 145)",
              color: "white",
              fontFamily: "'Outfit', sans-serif",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {t("nav.getCard")}
          </a>
        </div>
      </main>
    </div>
  );
}
