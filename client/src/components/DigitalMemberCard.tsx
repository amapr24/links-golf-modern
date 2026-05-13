import type { CSSProperties, ReactNode } from "react";
import { Camera } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { MEMBER_CARD_AERIAL_IMAGE } from "@/lib/memberCardDisplay";

export type DigitalMemberCardProps = {
  displayName: string;
  memberNumber: string;
  validUntil: string;
  season: string;
  /** http(s) or blob: preview URLs */
  photoUrl?: string | null;
  className?: string;
  /** Narrower padding and type scale (e.g. How it works mock). */
  compact?: boolean;
  /** Renders as a full-bleed strip under the aerial panel (badge, etc.). */
  footer?: ReactNode;
};

/**
 * Shared “digital ID” member card: course aerial, typography, stats row, photo ring.
 * Used on marketing (How it works), signup success, and dashboard.
 */
export function DigitalMemberCard({
  displayName,
  memberNumber,
  validUntil,
  season,
  photoUrl,
  className,
  compact,
  footer,
}: DigitalMemberCardProps) {
  const { t } = useLanguage();
  const showPhoto =
    Boolean(photoUrl) &&
    (photoUrl!.startsWith("http") || photoUrl!.startsWith("blob:"));

  const aerialPanelStyle: CSSProperties = {
    backgroundImage: `linear-gradient(145deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 55%, rgba(0,40,20,0.45) 100%), url(${MEMBER_CARD_AERIAL_IMAGE})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div
      className={cn(
        "rounded-sm overflow-hidden text-left border",
        className,
      )}
      style={{ borderColor: "oklch(0.88 0.02 85)" }}
    >
      <div className={cn(compact ? "p-4" : "p-5", compact ? "min-h-[10.5rem]" : "min-h-[11rem]")} style={aerialPanelStyle}>
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85 mb-0.5"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {t("memberCard.wordmark")}
        </p>
        <p
          className={cn(
            "font-medium text-white/90 mb-3",
            compact ? "text-[11px]" : "text-xs",
          )}
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {t("pricing.digitalId")}
        </p>
        <div className="flex justify-between gap-4 items-start">
          <div className="min-w-0 flex-1">
            <h4
              className={cn(
                "text-white font-semibold leading-tight truncate",
                compact
                  ? "text-lg"
                  : "text-xl sm:text-2xl",
              )}
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {displayName}
            </h4>
            <div
              className={cn(
                "mt-3 flex flex-wrap gap-x-4 gap-y-2 text-white/95",
                compact ? "text-[10px] gap-x-3" : "text-[11px] sm:text-xs gap-x-5",
              )}
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              <div>
                <span className="block text-white/45 uppercase text-[9px] tracking-wider mb-0.5">
                  {t("pricing.memberNoLabel")}
                </span>
                <span className="font-semibold tracking-wide">{memberNumber}</span>
              </div>
              <div>
                <span className="block text-white/45 uppercase text-[9px] tracking-wider mb-0.5">
                  {t("pricing.validUntilLabel")}
                </span>
                <span className="font-semibold">{validUntil}</span>
              </div>
              <div>
                <span className="block text-white/45 uppercase text-[9px] tracking-wider mb-0.5">
                  {t("pricing.seasonLabel")}
                </span>
                <span className="font-semibold">{season}</span>
              </div>
            </div>
          </div>
          <div
            className={cn(
              "rounded-full overflow-hidden border-2 border-white/45 flex-shrink-0 bg-black/25 flex items-center justify-center",
              compact ? "w-14 h-14" : "w-[4.5rem] h-[4.5rem]",
            )}
          >
            {showPhoto ? (
              <img src={photoUrl!} alt="" className="w-full h-full object-cover" />
            ) : (
              <Camera
                size={compact ? 18 : 22}
                className="text-white/35"
                aria-hidden
              />
            )}
          </div>
        </div>
      </div>
      {footer != null ? (
        <div
          className="px-4 py-2 text-center text-xs uppercase tracking-widest"
          style={{
            background: "oklch(0.42 0.14 145 / 0.3)",
            color: "oklch(0.65 0.14 145)",
            fontFamily: "'Outfit', sans-serif",
            borderTop: "1px solid oklch(0.42 0.14 145 / 0.2)",
          }}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}
