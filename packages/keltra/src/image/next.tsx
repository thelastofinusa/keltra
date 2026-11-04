// packages/keltra/src/image/next.tsx
import NextImage, { type ImageProps as NextImageProps } from "next/image";
import type { AssetPath } from "../index";

export type ImageProps = Omit<NextImageProps, "src"> & {
  /** One of the files in your asset folders. Autocompletes. */
  src: AssetPath;
};

/**
 * `next/image` with a typed `src`. Everything else (optimization, `fill`,
 * `priority`, `sizes`, `placeholder`...) is Next.js behaviour. Next applies
 * `basePath` itself, so no base handling is needed here.
 */
export function Image(props: ImageProps) {
  return <NextImage {...props} />;
}
