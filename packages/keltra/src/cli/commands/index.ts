import type { Command } from "commander";
import { generateCommand } from "./handlers/generate.handler";
import { initCommand } from "./handlers/init.handler";
import { updateCommand } from "./handlers/update.handler";

export const commandHandlers = {
  init: {
    register(program: Command) {
      initCommand()
        .definition(program)
        .action((options, command) => initCommand().handler(options, command));
    },
  },
  generate: {
    register(program: Command) {
      generateCommand()
        .definition(program)
        .action((options, command) =>
          generateCommand().handler(options, command),
        );
    },
  },
  update: {
    register(program: Command) {
      updateCommand()
        .definition(program)
        .action((options, command) =>
          updateCommand().handler(options, command),
        );
    },
  },
};
