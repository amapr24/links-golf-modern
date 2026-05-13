Links Golf Membership — brand kit (LGM Logos)
============================================

Canonical copy (Google Drive — same kit as in this repo; **anyone with the link** = viewer, no sign-in required):
https://drive.google.com/drive/folders/180FaEc3UYn0_3-oaQat2B1Vd_01hPiNH?usp=share_link

Use Drive when you want the latest exports without cloning; use this folder when
you need assets in CI or pinned to a git revision. Keep both in sync when the
brand pack changes.

Copied into the repo for design/dev reference. Original folder: "LGM Logos" (Documents).

Open Graph / social preview (client/public/og-share.png)
--------------------------------------------------------
Best master for a 1200×630 share image: PNG Files/LINKS-GOLF-MEMBERSHIP-9.png
(same dimensions as -8.png: 2560×1538 — script "Links" lockup on dark green).

The deployed og-share.png is a 1200×630 center-crop produced with macOS sips
(downscale max edge 1200px, then crop height to 630px). To regenerate after
changing the master:

  sips -Z 1200 "references/brand/lgm-logos/PNG Files/LINKS-GOLF-MEMBERSHIP-9.png" -o /tmp/og-step.png
  # cropOffset Y X — Y = (height - 630) / 2 after the step above
  sips -c 630 1200 --cropOffset <Y> 0 /tmp/og-step.png -o client/public/og-share.png

Alternates
----------
• PNG Files/LINKS-GOLF-MEMBERSHIP-1.png … -4.png (1177×653) — aspect ratio close
  to 1.91:1; small crop to 1200×630 if you prefer those layouts.
• Social Media Kit/*_Facebook.png (1183×439) — wide banner, not ideal for OG.
• Social Media Kit/*_Twitter.png (2084×695) — Twitter header format, not 1.91:1.
• Source & Vector File/ and Social Media Kit/Editable Files/*.ai — edit and export
  a dedicated 1200×630 artboard when you want full control (tagline, URL, etc.).
