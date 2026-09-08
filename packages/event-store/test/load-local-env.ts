import path from "node:path";

import { applyCheckoutLocalEnvironment } from "../src/local-env.js";

applyCheckoutLocalEnvironment(
  path.resolve(import.meta.dirname, "../../.."),
  process.env,
);
