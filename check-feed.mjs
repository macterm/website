// Fails the build when the site and the app disagree about the update feed.
//
// The app's SUFeedURL (Macterm/Info.plist) is baked into every installed copy,
// so an app polls whatever origin it was built with for ever.
// scripts/publish-appcast.sh writes the feed to the `appcast` branch, and the
// Caddyfile here proxies /appcast.xml and /notes/* from that branch. If any of
// them drifts, installs check a URL that nobody writes to and report "up to
// date" for the rest of their lives, with no error. The GitHub Pages feed of
// before 1.26.0 stranded every install that way.
//
// The files are in two repositories and cannot import each other, so this
// reads the app's two files from the Macterm checkout (see content.mjs) and
// pins them to the Caddyfile and SITE_URL. UpdaterChannelTests in
// macterm/macterm pins the app's side.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MACTERM_DIR, SITE_DIR } from "./content.mjs";
import { REPO } from "./releases.mjs";

const read = (dir, path) => readFileSync(join(dir, path), "utf8");
const infoPlist = read(MACTERM_DIR, "Macterm/Info.plist");
const publish = read(MACTERM_DIR, "scripts/publish-appcast.sh");
const caddyfile = read(SITE_DIR, "Caddyfile");
const buildDocs = read(SITE_DIR, "build-docs.mjs");

const failures = [];
const expect = (ok, message) => ok || failures.push(message);

const siteURL = buildDocs.match(/^const SITE_URL = "([^"]+)";$/m)?.[1];
expect(siteURL, "build-docs.mjs: no `const SITE_URL = \"…\";` line");
expect(
  infoPlist.includes(`<string>${siteURL}/appcast.xml</string>`),
  `Macterm/Info.plist: SUFeedURL is not ${siteURL}/appcast.xml`
);
expect(
  publish.includes(`SITE_URL="${siteURL}"`),
  `scripts/publish-appcast.sh: SITE_URL is not ${siteURL}`
);

// The notes URL keeps its `.html`, which the Caddyfile exempts from the
// redirect that strips the extension everywhere else. Drop either half and
// every published <sparkle:releaseNotesLink> 301s to a path that does not
// exist on the branch.
expect(
  publish.includes('NOTES_REL_PATH="notes/${TAG}.html"'),
  "scripts/publish-appcast.sh: NOTES_REL_PATH is not notes/${TAG}.html"
);
expect(caddyfile.includes("not path /notes/*"), "Caddyfile: /notes/* is not exempt from the .html redirect");

// The site proxies both paths from the branch that the publisher writes,
// rather than serving them out of an image built long before the release.
const branch = publish.match(/^FEED_BRANCH="([^"]+)"$/m)?.[1];
expect(branch, "scripts/publish-appcast.sh: no FEED_BRANCH=\"…\" line");
expect(caddyfile.includes("@updates path /appcast.xml /notes/*"), "Caddyfile: no @updates matcher");
expect(
  caddyfile.includes(`rewrite /${REPO}/${branch}{uri}`),
  `Caddyfile: the proxy does not rewrite to /${REPO}/${branch}{uri}`
);

if (failures.length) {
  console.error("check-feed: the site and the app disagree about the update feed:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`check-feed: ${siteURL}/appcast.xml is served from ${REPO}@${branch}`);
