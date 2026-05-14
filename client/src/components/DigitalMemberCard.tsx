import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  pickRandomMemberCardBackground,
  type MemberCardBackground,
} from "@/lib/memberCardBackgrounds";
import "./DigitalMemberCard.css";

const PERSON_PLACEHOLDER_SVG = (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path d="M12 12c2.7 0 4.8-2.2 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
  </svg>
);

export type DigitalMemberCardProps = {
  displayName: string;
  memberNumber: string;
  validUntil: string;
  /** http(s) or blob: preview URLs */
  photoUrl?: string | null;
  className?: string;
  /** Narrower padding and type scale (e.g. How it works mock). */
  compact?: boolean;
  /** Larger card + type on wide viewports (e.g. How it works desktop hero). */
  showcase?: boolean;
  /** Renders below the card (badge text, etc.). */
  footer?: ReactNode;
};

/**
 * Digital membership card — layout aligned with linksgolfprweb `fix/p0-audit`
 * (`index.html` `.m-card` / `.mc-*`). Brand: `public/links-golf-membership-brand.png`.
 * Background: random image from the [Unsplash Golf collection](https://unsplash.com/collections/bJnL-rJ3zAM/golf)
 * (API when `VITE_UNSPLASH_ACCESS_KEY` is set; otherwise static URLs from that collection).
 */
export function DigitalMemberCard({
  displayName,
  memberNumber,
  validUntil,
  photoUrl,
  className,
  compact,
  showcase,
  footer,
}: DigitalMemberCardProps) {
  const { t } = useLanguage();
  const [background, setBackground] = useState<MemberCardBackground | null>(null);

  useEffect(() => {
    let cancelled = false;
    pickRandomMemberCardBackground().then((bg) => {
      if (!cancelled) setBackground(bg);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const showPhoto =
    Boolean(photoUrl) &&
    (photoUrl!.startsWith("http") || photoUrl!.startsWith("blob:"));

  /** Inline height so showcase logo always wins over any CSS order / layers. */
  const showcaseBrandImgStyle =
    showcase && !compact
      ? ({
          height: "clamp(48px, 10vw, 68px)",
          width: "auto",
          objectFit: "contain" as const,
        } as const)
      : undefined;

  return (
    <div
      className={cn("digital-member-card", className)}
      data-compact={compact ? "true" : undefined}
      data-showcase={showcase ? "true" : undefined}
    >
      <div className="dmc-stage">
        <article className="dmc-article">
          {background?.url ? (
            <div
              className="dmc-bg-photo"
              style={{ backgroundImage: `url(${background.url})` }}
              aria-hidden
            />
          ) : null}
          {background?.credit ? <span className="sr-only">{background.credit}</span> : null}
          <div className="dmc-bg-scrim" aria-hidden />
          <div className="dmc-grid-overlay" aria-hidden />
          <div className="dmc-shimmer" aria-hidden />
          <div className="dmc-inner">
            <div className="dmc-top">
              <div className="dmc-brand">
                <img
                  className="dmc-brand-img"
                  src="/links-golf-membership-brand.png"
                  alt=""
                  style={showcaseBrandImgStyle}
                />
              </div>
              <div className="dmc-photo">
                {showPhoto ? (
                  <img src={photoUrl!} alt="" />
                ) : (
                  PERSON_PLACEHOLDER_SVG
                )}
              </div>
            </div>
            <div className="dmc-mid">
              <div className="dmc-name">{displayName}</div>
            </div>
            <div className="dmc-bot">
              <div className="dmc-meta">
                <div className="dmc-num">
                  <small>{t("pricing.memberNoLabel")}</small>
                  <span>{memberNumber}</span>
                </div>
                <div className="dmc-num">
                  <small>{t("pricing.validUntilLabel")}</small>
                  <span>{validUntil}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="dmc-bar" aria-hidden />
        </article>
      </div>
      {footer != null ? <div className="dmc-footer">{footer}</div> : null}
    </div>
  );
}
