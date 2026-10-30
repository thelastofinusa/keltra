import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { confirm } from "@inquirer/prompts";
import {
  checkForUpdateFresh,
  createSpinner,
  display,
  getPackageManager,
  type InferCommandOptions,
  showTree,
  typedCommand,
} from "@plekta/utils";
import chalk from "chalk";
import type { Command } from "commander";
import { pkg } from "../../../pkg.config";
import { createCommandTitle } from "../../core/cli";
import { exitWithError } from "../../core/errors";

const execFileAsync = promisify(execFile);

export const updateCommand = () => {
  const definition = (program: Command) =>
    typedCommand(program, "update")
      .description("Check for and install the latest version")
      .option("-y, --yes", "Skip update confirmation");

  const handler = async (
    options: InferCommandOptions<ReturnType<typeof definition>>,
    command?: Command,
  ) => {
    const pm = getPackageManager();

    const { commandTitle } = createCommandTitle({
      command,
      version: pkg.version,
    });

    display.intro({
      title: commandTitle,
      color: chalk.cyan,
      symbol: "gear",
    });

    const spinner = createSpinner("cyan");
    spinner.start("Checking npm registry..");

    const info = await checkForUpdateFresh(pkg.name, pkg.version);

    const renderVersionTree = () => {
      showTree({
        headerTitle: "Version Status",
        items: [
          {
            title: `Latest:     v${info.latest}`,
            description: `Installed:  v${info.current}`,
          },
        ],
        color: info.outdated ? chalk.yellow : chalk.cyan,
      });
    };

    if (!info.outdated) {
      spinner.succeed("Already up to date");

      console.log();
      renderVersionTree();
      console.log();

      display.outro({
        title: `You're running the latest version (v${info.current}).`,
        color: chalk.green,
        symbol: "success",
        margin: { top: false },
      });

      return;
    }

    spinner.succeed(`New version available: v${info.latest}`);

    console.log();
    renderVersionTree();
    console.log();

    if (!options.yes) {
      const shouldUpdate = await confirm({
        message: `Update to the latest version (v${info.latest})?`,
        default: true,
      });

      if (!shouldUpdate) {
        display.outro({
          title: "Update skipped.",
          color: chalk.dim,
          symbol: "info",
        });

        return;
      }
    }

    spinner.start(`Installing ${pkg.name}@${info.latest}..`);

    try {
      const [executable, ...args] = pm.installer.split(" ");

      await execFileAsync(executable as string, [
        ...args,
        "-g",
        `${pkg.name}@${info.latest}`,
      ]);

      spinner.succeed(`Updated ${pkg.name} to v${info.latest}`);

      display.outro({
        title: "Update completed successfully!",
        color: chalk.green,
        symbol: "success",
      });
    } catch (error) {
      exitWithError(error);
    }
  };

  return { definition, handler };
};
