// The `lastmod` of every sitemap entry, from git.
//
// A page's lastmod is the commit date of its source: docs/<file>.md in the
// Macterm checkout (see content.mjs) for a docs page, public/index.html of this
// repository for the landing page. The file's mtime is no use: `git checkout`
// sets it, and the image build copies a fresh clone, so every page would claim
// to have changed on every deploy. Google discounts a lastmod that behaves that
// way, and a discounted lastmod is worth less than none, because it also costs
// the signal on the pages that really changed.
//
// Two callers:
//
// - build-docs.mjs imports `lastModifiedDates` and asks git directly, which
//   covers `bun run build` in a checkout.
// - The image build has no git history (.containerignore leaves out both .git
//   folders), so `node lastmod.mjs` runs on the host first and writes the
//   dates to generated/lastmod.json, which rides into the build context. The
//   build workflow runs it before `podman build`, and so does the
//   `podman:build` script. build-docs.mjs reads the file only when git cannot
//   answer, so a stale file left in a checkout never wins over git.
//
// Both refuse a date from the edge of a shallow clone. At that edge, `git log
// -1 -- <file>` names the oldest commit the clone has, which is the commit that
// the clone was cut at and not the commit that changed the page. With
// `fetch-depth: 1`, that is one commit for every file, which is the
// "everything changed today" lie again. The workflow checks out both
// repositories with `fetch-depth: 0` for this reason. A clone that is cut
// deeper than the last change of every page is fine, and a developer's checkout
// often is one.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { MACTERM_DIR, PAGES_DIR, SITE_DIR } from "./content.mjs";

// Written into generated/ so that the Containerfile's `COPY . ./` carries it.
// Git ignores it.
export const LASTMOD_FILE = join(SITE_DIR, "generated", "lastmod.json");

// The keys of the dates: a path relative to the repository that holds the
// source. The landing page is written by hand, so it has no docs page.
export const LANDING_SOURCE = "public/index.html";
export const pageSource = (file) => `docs/${file}`;

function git(repo, args) {
  const run = spawnSync("git", args, { cwd: repo, encoding: "utf8" });
  if (run.error) throw new Error(`git is not available: ${run.error.message}`);
  if (run.status !== 0) {
    throw new Error(`git ${args.join(" ")} in ${repo} failed: ${run.stderr.trim()}`);
  }
  return run.stdout.trim();
}

// The commits at the edge of a shallow clone. Git lists them in the `shallow`
// file of the repository (the common dir, so a worktree reads its main
// checkout's). A full clone has no such file.
function shallowBoundary(repo) {
  const file = join(git(repo, ["rev-parse", "--path-format=absolute", "--git-common-dir"]), "shallow");
  if (!existsSync(file)) return new Set();
  return new Set(readFileSync(file, "utf8").split("\n").filter(Boolean));
}

function commitDate(repo, source, boundary) {
  // A source with uncommitted changes, or one that is not committed yet, is
  // newer than any commit, so it is "now". Production always builds from a
  // clean checkout, so this is only for a page in progress in a checkout.
  const dirty = git(repo, ["status", "--porcelain", "--", source]) !== "";
  const [hash, committed] = git(repo, ["log", "-1", "--format=%H %cI", "--", source]).split(" ");
  if (hash && boundary.has(hash)) {
    throw new Error(
      `the last change of ${source} in ${repo} is beyond the edge of this shallow clone, so ` +
        "its commit date is unknown. Fetch more history (fetch-depth: 0 in the workflow) first."
    );
  }
  const date = dirty || !committed ? new Date() : new Date(committed);
  return date.toISOString();
}

// Returns { "<source>": "<ISO 8601, UTC>" } for every page source, or throws
// when git cannot answer honestly (no repository, no git, a page whose last
// change is beyond the edge of a shallow clone).
export function lastModifiedDates() {
  const dates = {
    [LANDING_SOURCE]: commitDate(SITE_DIR, LANDING_SOURCE, shallowBoundary(SITE_DIR)),
  };
  const boundary = shallowBoundary(MACTERM_DIR);
  for (const file of readdirSync(PAGES_DIR).filter((f) => f.endsWith(".md")).sort()) {
    const source = pageSource(file);
    dates[source] = commitDate(MACTERM_DIR, source, boundary);
  }
  return dates;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const dates = lastModifiedDates();
  mkdirSync(dirname(LASTMOD_FILE), { recursive: true });
  writeFileSync(LASTMOD_FILE, JSON.stringify(dates, null, 2) + "\n");
  console.log(`lastmod: wrote ${Object.keys(dates).length} dates to ${LASTMOD_FILE}`);
}
