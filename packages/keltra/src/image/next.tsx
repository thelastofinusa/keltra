import NextImage, { type ImageProps as NextImageProps } from "next/image";
import { createElement, type ReactElement } from "react";
import type { AssetPath } from "../index";

export type ImageProps = Omit<NextImageProps, "src"> & {
  /** One of the files in your asset folders. Autocompletes. */
  src: AssetPath;
};

/**
 * `next/image` with a typed `src`. Everything else (optimization, `fill`,
 * `priority`, `sizes`, `placeholder`...) is Next.js behaviour. Next applies
 * `basePath` itself, so no base handling is needed here.
 *
 * Named `KTImg` so it can be used alongside `next/image` in the same file
 * without a naming clash.
 */
export function KTImg(props: ImageProps): ReactElement {
  return createElement(NextImage, props);
}

/** Back-compat alias. Prefer `KTImg` to avoid clashing with `next/image`. */
export const Image = KTImg;
