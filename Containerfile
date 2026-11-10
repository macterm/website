# Container image for the marketing site and docs (see README.md).
#
#     podman build --format docker -f Containerfile -t macterm-website .
#
# The build context is this repository with a checkout of macterm/macterm in
# ./macterm (`bun run fetch`, or the workflow's second checkout). The docs
# pages and the assets come from that checkout (see content.mjs).
# .containerignore keeps both .git folders and every host build out.
#
# `--format docker` because the OCI image format has no HEALTHCHECK: podman's
# default would build the image and silently drop the one below.
#
# Run `node lastmod.mjs` on the host before the build. The build stage has no
# git history, and that script writes the commit date of every page to
# generated/lastmod.json, which `bun run build` turns into the sitemap's
# <lastmod>. Without the file, check-seo.mjs fails the build on purpose. The
# `podman:build` script and the Build workflow both run it.
#
# Run `node releases.mjs` on the host too. It writes the release notes of the
# changelog page to generated/releases.json, with the host's token. Without the
# file, the build stage asks GitHub anonymously, which a shared CI address can
# be refused. The same two callers run it.
#
# Bun builds, Caddy serves. The site is static once `bun run build` has
# rendered the docs and compiled the CSS, so the runtime stage carries no
# JavaScript at all — no Bun, no node_modules, just Caddy and public/.

# The base images are written out in each FROM, never passed through an ARG:
# Dependabot reads only literal `FROM image:tag` lines, so an image named by a
# variable is never tracked. They are fully qualified because podman resolves
# a short name through registries.conf, which errors without a TTY when more
# than one search registry is configured; Dependabot treats `docker.io/` as
# Docker Hub, so the qualification costs it nothing.

# ---- deps: resolved once, cached until the lockfile moves -------------------
FROM docker.io/oven/bun:1.4-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# ---- build: render macterm/docs/*.md and compile the design tokens ---------
FROM docker.io/oven/bun:1.4-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . ./
RUN bun run build

# ---- runtime ---------------------------------------------------------------
FROM docker.io/library/caddy:2-alpine AS runtime

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/public /srv

ENV PORT=3000 \
    SITE_ROOT=/srv

# Nothing is written at runtime: TLS is terminated upstream, and the Caddyfile
# turns off the admin API and config persistence.
USER 1000:1000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- "http://127.0.0.1:${PORT}/healthz" || exit 1

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
