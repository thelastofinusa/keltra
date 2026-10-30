import { display } from "@plekta/utils";
import chalk from "chalk";

export type KeltraErrorCode =
  | "NO_PACKAGE_JSON"
  | "CONFIG_LOAD_FAILED"
  | "INSTALL_FAILED"
  | "GENERATE_FAILED";

/**
 * Every failure raised by keltra's own checks. The `code` is stable, so
 * callers can branch on it instead of matching message text.
 */
export class KeltraError extends Error {
  readonly code: KeltraErrorCode;

  constructor(code: KeltraErrorCode, message: string) {
    super(message);
    this.name = "KeltraError";
    this.code = code;
  }
}

/**
 * Print an error the way every command does, then exit with code 1.
 *
 * A cancelled prompt (Ctrl-C) is rethrown instead, so the shared
 * cancellation handler in index.ts can deal with it.
 */
export function exitWithError(error: unknown): never {
  if (error instanceof Error && error.name === "ExitPromptError") {
    throw error;
  }

  const message = error instanceof Error ? error.message : String(error);

  // Unexpected errors (bugs, not keltra's own checks) get their stack on request.
  if (!(error instanceof KeltraError) && process.env.KELTRA_DEBUG) {
    console.error(error);
  }

  display.outro({
    title: message,
    color: chalk.red,
    symbol: "error",
    exitType: 1,
  });

  return process.exit(1);
}