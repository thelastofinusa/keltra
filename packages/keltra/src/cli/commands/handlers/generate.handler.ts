import path from "node:path";
import {
  createSpinner,
  display,
  type InferCommandOptions,
  showTree,
  typedCommand,
} from "@plekta/utils";
import chalk from "chalk";
import type { Command } from "commander";
import { createKeltra } from "../../../core";
import { loadConfig } from "../../../core/load-config";
import { pkg } from "../../../pkg.config";
import { createCommandTitle } from "../../core/cli";
import { exitWithError, KeltraError } from "../../core/errors";

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

export const generateCommand = () => {
  const definition = (program: Command) =>
    typedCommand(program, "generate")
      .description("Generate the typed asset manifest")
      .option("-w, --watch", "Watch asset folders and regenerate on changes");

  const handler = async (
    options: InferCommandOptions<ReturnType<typeof definition>>,
    command?: Command,
  ) => {
    const { commandTitle } = createCommandTitle({
      command,
      version: pkg.version,
    });

    display.intro({
      title: commandTitle,
      color: chalk.cyan,
    });

    const spinner = createSpinner("cyan");

    try {
      const root = process.cwd();

      spinner.start("Scanning assets..");

      const userConfig = await loadConfig(root).catch((error: unknown) => {
        const reason = error instanceof Error ? error.message : String(error);
        throw new KeltraError(
          "CONFIG_LOAD_FAILED",
          `Could not load your keltra config: ${reason}`,
        );
      });

      const keltra = createKeltra(userConfig, root);
      const result = await keltra.generate();

      spinner.succeed(`Found ${plural(result.assets.length, "asset")}`);

      const folders = keltra.config.dirs.map((d) => d.dir).join(", ");

      showTree({
        headerTitle: "Manifest",
        items: [
          {
            title: `Assets: ${chalk.green(result.assets.length)}`,
            description: `Scanned: ${folders}`,
          },
          {
            title: `Output: ${chalk.cyan(path.relative(root, result.outDir) || ".")}`,
            description: result.changed ? "Updated" : "Already up to date",
          },
        ],
        color: chalk.cyan,
        margin: { top: true },
      });

      if (options.watch) {
        keltra.watch((update) => {
          console.log(
            `${chalk.green("✔")} Manifest updated (${plural(update.assets.length, "asset")})`,
          );
        });

        console.log(chalk.dim("\nWatching for changes. Press Ctrl+C to stop."));
        return;
      }

      display.outro({
        title: "Manifest generated!",
        color: chalk.green,
      });
    } catch (error) {
      spinner.stop();
      exitWithError(error);
    }
  };

  return { definition, handler };
};
