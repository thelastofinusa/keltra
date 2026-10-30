import { createCli } from "@plekta/utils";
import { pkg } from "../../pkg.config";

export const { createCommandTitle, resolveCommandName } = createCli({
  name: pkg.name,
  aliases: [pkg.name],
});
