import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { appendFile, readFile, writeFile } from "node:fs/promises";
import path, { relative } from "node:path";
import { promisify } from "node:util";
import { confirm, input, select } from "@inquirer/prompts";
import {
  createSpinner,
  display,
  getPackageManager,
  type InferCommandOptions,
  showTree,
  typedCommand,
} from "@plekta/utils";
import chalk from "chalk";
import type { Command } from "commander";
import { createKeltra, type KeltraConfig } from "../../../core";
import {
  addKeltraTypesToTsConfig,
  addNextIntegration,
  addViteIntegration,
  type EditStatus,
  findTsConfigFile,
  KELTRA_TYPES_GLOB,
} from "../../../core/edits";
import { findConfigFile, loadConfig } from "../../../core/load-config";
import { pkg } from "../../../pkg.config";
import { createCommandTitle } from "../../core/cli";
import { exitWithError, KeltraError } from "../../core/errors";
import {
  detectFramework,
  FRAMEWORKS,
  type Framework,
  getFramework,
  hasDependency,
  readPackageJson,
} from "../../core/project";

const execFileAsync = promisify(execFile);

const CONFIG_FILE = "keltra.config.ts";

async function installPackage(root: string, name: string): Promise<void> {
  const pm = getPackageManager();
  const [executable, ...args] = pm.installer.split(" ");

  if (!executable) {
    throw new KeltraError(
      "INSTALL_FAILED",
      "Could not detect a package manager.",
    );
  }

  try {
    await execFileAsync(executable, [...args, name], {
      cwd: root,
      shell: process.platform === "win32",
    });
  } catch {
    throw new KeltraError(
      "INSTALL_FAILED",
      `Could not install ${name}. Run \`${pm.installer} ${name}\` yourself, then run init again.`,
    );
  }
}

/** Creates keltra.config.ts, unless the project already has a config. */
async function writeConfigFile(
  root: string,
  assetDir: string,
): Promise<"created" | "exists"> {
  if (findConfigFile(root)) return "exists";

  const content = `import { defineConfig } from "keltra";

export default defineConfig({
  dirs: [${JSON.stringify(assetDir)}],
});
`;

  await writeFile(path.join(root, CONFIG_FILE), content);
  return "created";
}

/** Adds .keltra/ to .gitignore when the project has one. */
async function ignoreGeneratedFiles(root: string): Promise<boolean> {
  const file = path.join(root, ".gitignore");
  if (!existsSync(file)) return false;

  const current = await readFile(file, "utf8");
  const alreadyIgnored = current
    .split(/\r?\n/)
    .some((line) => line.trim() === ".keltra" || line.trim() === ".keltra/");
  if (alreadyIgnored) return false;

  const separator = current.endsWith("\n") || current === "" ? "" : "\n";
  await appendFile(file, `${separator}\n# keltra generated files\n.keltra/\n`);
  return true;
}

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

export const initCommand = () => {
  const definition = (program: Command) =>
    typedCommand(program, "init")
      .description(`Set up ${pkg.name} in an existing project`)
      .argument("[dir]", "Project directory (defaults to the current one)")
      .option("-y, --yes", "Skip prompts and use the detected defaults");

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
      const root = path.resolve(process.cwd(), command?.args[0] ?? ".");
      const projectPackage = await readPackageJson(root);

      if (!projectPackage) {
        throw new KeltraError(
          "NO_PACKAGE_JSON",
          `No package.json found in ${root}. Run this inside your project.`,
        );
      }

      const skipPrompts = Boolean(options.yes);
      const detected = detectFramework(projectPackage);

      // 1. Framework — confirm the detected one first, fall back to the list.
      const chooseFramework = () =>
        select<Framework>({
          message: "Select your framework:",
          default: detected,
          choices: FRAMEWORKS.map((f) => ({
            name: f.value === detected ? `${f.name} (detected)` : f.name,
            value: f.value,
            description: f.description,
          })),
        });

      let framework: Framework;
      if (skipPrompts) {
        framework = detected;
      } else if (detected !== "other") {
        const detectedInfo = getFramework(detected);
        const confirmed = await confirm({
          message: `Detected ${chalk.cyan(detectedInfo.name)}. Is that your framework?`,
          default: true,
        });
        framework = confirmed ? detected : await chooseFramework();
      } else {
        framework = await chooseFramework();
      }

      const info = getFramework(framework);

      // 2. Asset folder
      const assetDir = skipPrompts
        ? info.assetDir
        : (
            await input({
              message: "Where are your assets?",
              default: info.assetDir,
              validate: (value) =>
                value.trim() ? true : "Folder name cannot be empty.",
            })
          ).trim();

      // 3. Install
      const alreadyInstalled = hasDependency(projectPackage, pkg.name);
      const shouldInstall = alreadyInstalled
        ? false
        : skipPrompts ||
          (await confirm({
            message: `Install ${pkg.name} in this project?`,
            default: true,
          }));

      if (shouldInstall) {
        spinner.start(`Installing ${pkg.name}..`);
        await installPackage(root, pkg.name);
        spinner.succeed(`Installed ${pkg.name}`);
      }

      // 4. Config + .gitignore
      spinner.start("Writing configuration..");
      const configStatus = await writeConfigFile(root, assetDir);
      const gitignoreUpdated = await ignoreGeneratedFiles(root);
      spinner.succeed(
        configStatus === "created"
          ? `Created ${CONFIG_FILE}`
          : "Found an existing keltra config",
      );

      // 5. First manifest, so autocomplete works right away
      spinner.start("Generating type manifest..");

      let userConfig: KeltraConfig = { dirs: [assetDir] };
      if (configStatus === "exists") {
        try {
          userConfig = await loadConfig(root);
        } catch {
          // The config may import "keltra" before it is installed.
          // Fall back to the folder chosen above.
        }
      }

      const { assets } = await createKeltra(userConfig, root).generate();
      spinner.succeed(`Found ${plural(assets.length, "asset")}`);

      // 6. Wire up the project automatically
      spinner.start("Wiring up your project..");

      const tsconfigFile = await findTsConfigFile(root, framework);
      let tsconfigStatus: EditStatus = "skipped";
      if (tsconfigFile) {
        tsconfigStatus = await addKeltraTypesToTsConfig(tsconfigFile);
      }

      let frameworkConfigStatus: EditStatus = "skipped";
      if (framework === "next") {
        frameworkConfigStatus = await addNextIntegration(root);
      } else if (framework === "vite") {
        frameworkConfigStatus = await addViteIntegration(root);
      }

      spinner.succeed("Project wired up");

      // Summary
      const summaryItems: Array<{ title: string; description: string }> = [
        {
          title: `Framework: ${chalk.yellow(info.name)}`,
          description: `Asset folder: ${assetDir}`,
        },
        {
          title: `Config: ${chalk.green(CONFIG_FILE)}`,
          description:
            configStatus === "created"
              ? "Created"
              : "Kept your existing config",
        },
        {
          title: `Manifest: ${chalk.cyan(".keltra/")}`,
          description: `${plural(assets.length, "asset")} found${
            gitignoreUpdated ? " (added to .gitignore)" : ""
          }`,
        },
      ];

      if (tsconfigFile) {
        summaryItems.push({
          title: `tsconfig: ${chalk.cyan(relative(root, tsconfigFile))}`,
          description:
            tsconfigStatus === "added"
              ? `Added ${KELTRA_TYPES_GLOB}`
              : tsconfigStatus === "already"
                ? `Already includes ${KELTRA_TYPES_GLOB}`
                : "Could not update — add it manually",
        });
      }

      if (info.integration) {
        summaryItems.push({
          title: `${info.integration.file}: ${chalk.cyan(relative(root, info.integration.file))}`,
          description:
            frameworkConfigStatus === "added"
              ? "Added keltra integration"
              : frameworkConfigStatus === "already"
                ? "Already wired up"
                : "Could not update — add it manually",
        });
      }

      showTree({
        headerTitle: "Setup Summary",
        items: summaryItems,
        color: chalk.cyan,
        margin: { top: true },
      });

      const nextSteps: Array<{ title: string; description: string }> = [];

      // Only list the framework integration if auto-edit was skipped.
      if (info.integration && frameworkConfigStatus === "skipped") {
        const { file, importLine, usage } = info.integration;
        nextSteps.push({
          title: `Add keltra to ${chalk.cyan(file)}`,
          description: importLine ? `${importLine}, then ${usage}` : usage,
        });
      }

      // Only list the tsconfig step if auto-edit was skipped or the file is missing.
      if (!tsconfigFile || tsconfigStatus === "skipped") {
        nextSteps.push({
          title: `Include ${chalk.cyan(".keltra")} in your tsconfig`,
          description: '"include": ["src", ".keltra/*.d.ts"]',
        });
      }

      nextSteps.push(
        info.integration
          ? {
              title: "Start your dev server",
              description: "Types update as you add or remove assets",
            }
          : {
              title: `Run ${chalk.cyan("keltra generate")}`,
              description: "Run it before type-checking, or add it to a script",
            },
      );

      if (nextSteps.length > 0) {
        showTree({
          headerTitle: "Next Steps",
          items: nextSteps,
          color: chalk.yellow,
          margin: { top: true },
        });
      }

      display.outro({
        title: "keltra is ready!",
        color: chalk.green,
      });
    } catch (error) {
      spinner.stop();
      exitWithError(error);
    }
  };

  return { definition, handler };
};
