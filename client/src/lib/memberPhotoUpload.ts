/**
 * Resize and re-encode member verification photos before Supabase upload.
 * iPhone often produces HEIC or very large files; buckets frequently allow only image/jpeg.
 */

const MAX_EDGE = 2048;
const JPEG_QUALITY = 0.86;

function isProbablyHeic(file: File): boolean {
  const t = file.type.toLowerCase();
  if (t === "image/heic" || t === "image/heif") return true;
  const n = file.name.toLowerCase();
  return n.endsWith(".heic") || n.endsWith(".heif");
}

/**
 * Returns a JPEG File suitable for storage, or the original file if it is not an image.
 * Throws if the image cannot be decoded (e.g. HEIC on a browser that does not support it).
 */
export async function normalizeMemberPhotoForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/") && !isProbablyHeic(file)) {
    return file;
  }

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("IMAGE_DECODE_FAILED"));
      img.src = url;
    });

    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!nw || !nh) {
      throw new Error("IMAGE_DECODE_FAILED");
    }

    const scale = Math.min(1, MAX_EDGE / Math.max(nw, nh));
    const w = Math.max(1, Math.round(nw * scale));
    const h = Math.max(1, Math.round(nh * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return file;
    }
    ctx.drawImage(img, 0, 0, w, h);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/jpeg", JPEG_QUALITY);
    });

    if (!blob || blob.size < 80) {
      return file;
    }

    return new File([blob], "verification-photo.jpg", {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (e) {
    const decodeFailed = e instanceof Error && e.message === "IMAGE_DECODE_FAILED";
    if (decodeFailed && isProbablyHeic(file)) {
      throw new Error("PHOTO_FORMAT_UNSUPPORTED");
    }
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}
