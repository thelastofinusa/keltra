import { withKeltra } from "keltra/next";

export default withKeltra({
  // Try keltra under a sub-path: BASE_PATH=/docs bun run dev
  basePath: process.env.BASE_PATH || undefined,
});
