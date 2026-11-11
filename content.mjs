// Where the site's content comes from: a checkout of macterm/macterm.
//
// The docs pages (docs/*.md) and the assets (assets/: icons, schemas) live in the app's repository, so that a feature and its docs land in
// one pull request there. This repository has the site that renders them.
//
// MACTERM_DIR names the checkout. Without it, the checkout is ./macterm, which
// is where the workflow and `bun run fetch` put it. Git ignores ./macterm.

import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

export const SITE_DIR = here;
export const MACTERM_DIR = process.env.MACTERM_DIR
  ? resolve(process.env.MACTERM_DIR)
  : join(here, "macterm");
export const PAGES_DIR = join(MACTERM_DIR, "docs");
export const ASSETS_DIR = join(MACTERM_DIR, "assets");
// The landing page's demo clips are in this repository, not in the checkout.
export const DEMO_DIR = join(here, "assets", "demo");

// Fails with the fix in the message, because a missing checkout otherwise
// reads as "no .md files" or a missing image much later in the build.
export function requireCheckout() {
  if (!existsSync(PAGES_DIR) || !existsSync(ASSETS_DIR)) {
    throw new Error(
      `no Macterm checkout at ${MACTERM_DIR} (it needs docs/ and assets/). ` +
        "Run `bun run fetch`, or set MACTERM_DIR to a checkout of macterm/macterm."
    );
  }
}
