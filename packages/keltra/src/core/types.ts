/** A folder to scan, optionally mapped to a URL prefix. */
export interface AssetDir {
  /** Folder path, relative to the project root. */
  dir: string;
  /** URL prefix for files in this folder. Defaults to "/". */
  prefix?: string;
}

/** Options users can pass to keltra. Everything is optional. */
export interface KeltraConfig {
  /**
   * Folders to scan for assets.
   * @default [{ dir: "public", prefix: "/" }]
   */
  dirs?: Array<string | AssetDir>;
  /**
   * File extensions to include (no leading dot).
   * @default images, video, audio, fonts and pdf
   */
  extensions?: string[];
  /** Glob patterns to skip, relative to each scanned folder. */
  ignore?: string[];
  /**
   * Where generated files are written, relative to the project root.
   * @default ".keltra"
   */
  outDir?: string;
}

export interface ResolvedDir {
  dir: string;
  /** Normalized: "" for the root, otherwise "/something" (no trailing slash). */
  prefix: string;
}

/** Config after defaults are applied. Used everywhere inside core. */
export interface ResolvedConfig {
  /** Absolute path to the project root. */
  root: string;
  dirs: ResolvedDir[];
  extensions: string[];
  ignore: string[];
  outDir: string;
}

export interface ScannedAsset {
  /** The typed path users write in code, e.g. "/images/hero.png". */
  path: string;
  /** File location relative to the project root, e.g. "public/images/hero.png". */
  file: string;
  /** Lowercase extension without the dot, e.g. "png". */
  ext: string;
}

export interface GenerateResult {
  assets: ScannedAsset[];
  /** Absolute path of the folder the files were written to. */
  outDir: string;
  /** False when nothing on disk needed to change. */
  changed: boolean;
}
