// Builds public/assets and public/schemas from two places.
//
// - assets/ of the Macterm checkout (see content.mjs): icons, hero, and the
//   schemas. The copy replaces the folder each time, so a file removed from
//   macterm/assets is gone here too.
// - assets/demo/ of this repository: the clips of the landing page, served as
//   /assets/demo/…. They are here, not in macterm/macterm.
//
// The schemas are also served at /schemas/<name>.schema.json, the address that
// the files of a user name. macterm/assets stays their one source, because the
// unit tests of the app check them against the code. Git ignores both outputs.

import { cpSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { ASSETS_DIR, DEMO_DIR, SITE_DIR, requireCheckout } from "./content.mjs";

requireCheckout();
const target = join(SITE_DIR, "public", "assets");
const schemas = join(SITE_DIR, "public", "schemas");
rmSync(target, { recursive: true, force: true });
rmSync(schemas, { recursive: true, force: true });
cpSync(ASSETS_DIR, target, { recursive: true });
cpSync(DEMO_DIR, join(target, "demo"), { recursive: true });

mkdirSync(schemas, { recursive: true });
const names = readdirSync(ASSETS_DIR).filter((name) => name.endsWith(".schema.json"));
if (names.length === 0) throw new Error(`no *.schema.json in ${ASSETS_DIR}`);
for (const name of names) cpSync(join(ASSETS_DIR, name), join(schemas, name));
console.log(
  `copy-assets: copied ${ASSETS_DIR} and ${DEMO_DIR} to ${target}, ${names.length} schemas to ${schemas}`
);
