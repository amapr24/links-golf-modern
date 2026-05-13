Links Golf Membership — brand assets (pointer only)
===================================================

Full logo kit (vectors, stationery, social masters) lives on Google Drive — not
in this repository, to keep clones and CI small.

Public folder (anyone with the link = viewer):
https://drive.google.com/drive/folders/180FaEc3UYn0_3-oaQat2B1Vd_01hPiNH?usp=share_link

Shipped web asset
-----------------
`client/public/og-share.png` — 1200×630 Open Graph / Twitter preview image.
Regenerate when the brand lockup changes:

1. From the Drive folder, download `PNG Files/LINKS-GOLF-MEMBERSHIP-9.png`
   (script lockup on dark green; same aspect as -8.png).

2. On macOS, from the repo root (adjust path to your download):

   sips -Z 1200 "$HOME/Downloads/LINKS-GOLF-MEMBERSHIP-9.png" -o /tmp/og-step.png
   sips -g pixelHeight /tmp/og-step.png
   # Let H = pixelHeight printed above. Y = (H - 630) / 2 (integer).
   sips -c 630 1200 --cropOffset <Y> 0 /tmp/og-step.png -o client/public/og-share.png

3. Commit the updated `client/public/og-share.png`.

Other formats (Facebook/Twitter header sizes, .ai sources) stay in Drive only.
