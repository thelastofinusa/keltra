import type { ImgHTMLAttributes, ReactElement } from "react";
// Import from the root entry (not core) so the types stay tied to the
// `Register` interface that `.keltra/register.d.ts` augments.
import { type AssetPath, assetPath } from "../index";

export interface ImageProps
  extends Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    "src" | "alt" | "width" | "height"
  > {
  /** One of the files in your asset folders. Autocompletes. */
  src: AssetPath;
  /** Required, like `next/image`. Use `""` for purely decorative images. */
  alt: string;
  width?: number;
  height?: number;
  /**
   * Stretch the image to fill its parent, like `next/image`.
   * The parent needs `position: relative` (or absolute / fixed).
   */
  fill?: boolean;
  /**
   * Load eagerly with high fetch priority. Use it for the main image above
   * the fold. The `fetchPriority` hint needs React 19.
   */
  priority?: boolean;
}

/**
 * A plain `<img>` with a typed `src`, the app's base path applied, and
 * sensible loading defaults. It does not resize or convert images.
 *
 * Named `KTImg` so it can be used alongside `next/image` in the same file
 * without a naming clash.
 */
export function KTImg({
  src,
  alt,
  width,
  height,
  fill,
  priority,
  loading,
  decoding,
  style,
  ...rest
}: ImageProps): ReactElement {
  return (
    <img
      {...rest}
      src={assetPath(src)}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={loading ?? (priority ? "eager" : "lazy")}
      decoding={decoding ?? "async"}
      fetchPriority={priority ? "high" : rest.fetchPriority}
      style={
        fill
          ? {
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              ...style,
            }
          : style
      }
    />
  );
}

/** Back-compat alias. Prefer `KTImg` to avoid clashing with `next/image`. */
export const Image = KTImg;
