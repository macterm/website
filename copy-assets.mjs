// Copies assets/ of the Macterm checkout (see content.mjs) to public/assets,
// where Caddy serves it as /assets/… and build-images.mjs reads it. The copy
// replaces the folder each time, so a file removed from assets/ is gone here
// too. Git ignores public/assets.

import { cpSync, rmSync } from "node:fs";
import { join } from "node:path";
import { ASSETS_DIR, SITE_DIR, requireCheckout } from "./content.mjs";

requireCheckout();
const target = join(SITE_DIR, "public", "assets");
rmSync(target, { recursive: true, force: true });
cpSync(ASSETS_DIR, target, { recursive: true });
console.log(`copy-assets: copied ${ASSETS_DIR} to ${target}`);
