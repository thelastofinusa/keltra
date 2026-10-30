#!/usr/bin/env node

import { checkForUpdate, onCancel, showTree, symbols } from "@plekta/utils";
import chalk from "chalk";
import { Command } from "commander";
import { pkg } from "../pkg.config";
import { commandHandlers } from "./commands";
import { resolveCommandName } from "./core/cli";

const invoked = process.argv[2] ?? "";
const SKIP_PASSIVE_CHECK = new Set(["update", "-h", "--help"]);

async function main() {
  if (!SKIP_PASSIVE_CHECK.has(invoked)) {
    await Promise.race([
      (async () => {
        const command = resolveCommandName();

        const info = await checkForUpdate(pkg.name, pkg.version);

        if (info.outdated) {
          showTree({
            margin: { top: true },
            headerTitle: "update available",
            items: [
              {
                title: `v${info.latest} is now available (current: v${info.current})`,
                description: `Run \`${command} update\` to upgrade to the latest version.`,
              },
            ],
            color: chalk.yellow,
          });
        }
      })(),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]);
  }

  const program = new Command();

  program
    .name(pkg.name)
    .description(pkg.description)
    .version(pkg.version, "-v, --version", "show version");

  program.configureOutput({
    writeOut: (str) => {
      if (str.trim() === pkg.version) {
        const nodeVersion = process.version;

        process.stdout.write(
          `v${pkg.version}\n${`${symbols.chevron} node ${nodeVersion} (from PATH)`}\n`,
        );

        return;
      }

      process.stdout.write(str);
    },
  });

  for (const handler of Object.values(commandHandlers)) {
    handler.register(program);
  }

  // Parse arguments inside the shared cancellation wrapper.
  await onCancel(async () => {
    await program.parseAsync(process.argv);
  })();
}

void main();
