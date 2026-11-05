import NextImage, { type ImageProps as NextImageProps } from "next/image";
import { createElement, type ReactElement } from "react";
import type { AssetPath } from "../index";

export type ImgProps = Omit<NextImageProps, "src"> & {
  /** One of the files in your asset folders. Autocompletes. */
  src: AssetPath;
};

/**
 * `next/image` with a typed `src`. Everything else (optimization, `fill`,
 * `priority`, `sizes`, `placeholder`...) is Next.js behaviour. Next applies
 * `basePath` itself, so no base handling is needed here.
 */
export function Img(props: ImgProps): ReactElement {
  return createElement(NextImage, props);
}
