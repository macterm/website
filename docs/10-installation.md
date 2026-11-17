<!-- page:
slug: install
title: Installation
nav: Installation
group: Getting started
description: Install Macterm with Homebrew or a direct .dmg download.
-->

# Installation

## Homebrew

This is the recommended way. The cask clears the Gatekeeper quarantine for you.

```sh
brew install --cask macterm/tap/macterm
```

> The tap was `thdxg/tap` before November 2026. If you installed from it, run `brew reinstall --cask macterm/tap/macterm` one time to move Macterm to `macterm/tap`. Until you do, Macterm keeps its updates through its own updater.

## From Releases

Download the latest `.dmg` from the [Releases page](https://github.com/macterm/macterm/releases/latest). Drag Macterm to Applications. Then clear the quarantine flag one time:

```sh
xattr -cr /Applications/Macterm.app
```

After that, Sparkle installs updates. You do not need `xattr` again.

## Updates

Macterm checks for updates each day. It downloads an update automatically and installs it when you quit Macterm. Macterm shows no dialog for an update:

- While Macterm downloads an update, the toolbar shows **Downloading…** with a progress ring.
- When the update is ready, the toolbar shows **Restart to Update**. Click it to install the update and start Macterm again. Your sessions continue after the restart. If you do not click it, the update installs when you quit Macterm.
- To check now, choose **Macterm → Check for Updates…** or **Settings → Updates → Check for Updates Now**. If you have the newest version, Macterm shows "Macterm is up to date". If the check or the download fails, Macterm shows one line about the failure.

Macterm does not show release notes. Read them on the [changelog](/changelog).

With no window open, use the menu item: while an update is ready, **Check for Updates…** is **Restart to Update**. An app with no menu bar (`macos-hidden = always`) installs the update when you quit it.
