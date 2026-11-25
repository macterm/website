<!-- page:
slug: command-palette
title: Command palette
nav: Command palette
group: Everyday use
description: Use Macterm from the keyboard with the ⌘P command palette.
-->

# Command palette

Press <kbd>⌘P</kbd>. One list searches everything:

- **Palettes**: the screens below. This is the first section after your recent projects. A row with an icon and a chevron opens a screen in the same place.
- **Commands**: split, close and focus panes. Create, rename, pin and switch tabs. Show or hide parts of the window. Each row shows its current keybind.
- **Projects**: go to any project. With nothing typed, the recent projects are first. Under a project inside another project, the palette shows the names of the projects above it (`Work/api`). Under a project at the top level, it shows the folder. A search also finds a project by those names. Rename or remove the current project with its commands.

**To change the tree of projects and tabs from the keyboard**, use these commands. They are also in the **Project** menu.

- **New Project Inside** opens a folder. The new project goes inside the current project.
- **Move to Project** moves a tab or a project to another project. It moves the tab that shows. To move a project, click its row in the sidebar first, so that the window shows the project. The list shows the projects that can take it, each with its path of names (`Work/api`). Type a name or a path to filter the list. Select a project and press <kbd>↩</kbd>. The **Move to Project** item of the sidebar menu of a tab or a project does the same.
- **Move Out of Project** moves the current project out of its parent. It shows only for a project inside another project.

**To open a folder as a project**, type a path that starts with `/` or `~`. The palette changes to path mode and completes folder names.

**New Project** (<kbd>⌘O</kbd>) opens the New Project screen. The **New Project** button at the bottom of the sidebar, **File → New Project…** and the Dock menu also open it.

- With nothing typed, the screen shows **Select in Finder** and **Cancel**. Select **Select in Finder** to select the folder in a panel.
- Type the path of a folder. The rows are the folders that exist for the path, the same as in path mode. Press <kbd>Return</kbd> or click a row to add that folder as a project. If a project already has that folder, the row selects that project, and the row below adds another project. A remote spec opens the folder step of **New Remote Project**.
- Press <kbd>Tab</kbd> to put the selected folder in the field. Press <kbd>Tab</kbd> again to go into it.
- If no folder matches the path, the screen tells you that the path does not exist, and shows no rows.

**To add a remote project**, choose **New Remote Project** and select a host of your `~/.ssh/config`, or type a spec such as `devbox:~/dev/api`. See [remote projects](/docs/remote-projects).

Some commands open a screen of their own in the palette. A pill above the palette names the screen. In the list, a row for such a screen shows the icon of the screen and a chevron. A screen can open another screen. The pills then show a trail, with the root first. Click a pill to go back to it. Press <kbd>Esc</kbd> to go back one screen. You can also press <kbd>Delete</kbd> with nothing typed. A held <kbd>Delete</kbd> clears the search and stops at the empty field.

A screen that must wait for its list shows a spinner. If the list fails, the screen says why and shows a Retry button. <kbd>⌘R</kbd> also retries.

**Some rows have a second action** under <kbd>⌥</kbd>. Hold the key. The subtitle of the row then names what <kbd>⌥↩</kbd> (or an ⌥-click) does.

**Rename Current Tab** (<kbd>⌘R</kbd>) and **Rename Current Project** ask for the new name in the palette. The field shows the current name, selected. When you type a new name, the row **Rename to "name"** shows under the field. Press <kbd>Return</kbd> on that row to rename, or <kbd>Esc</kbd> to keep the name. To give a tab its automatic name again, clear the field: the row changes to **Use the automatic name**. If a project cannot have the name, the palette shows the reason and no row. You can also double-click a row in the sidebar to rename it there.

Each screen can have its own keybind in Settings → Keymaps, under **Palettes**, next to <kbd>⌘P</kbd>. No screen has a keybind by default. The keybind opens the palette on that screen. Press it again on that screen to close the palette. Press it on another screen to go to its screen.

- **Password Manager** lists your saved passwords. Select one to type it into the focused pane (see [passwords](/docs/passwords#typing-a-password-on-demand)).
- **Files** lists the files and directories of the current project. Search by name or by part of a path (`pal/eng` finds `Palette/PaletteEngine.swift`). Select one to open it in a split next to the focused pane. If the project has no pane, it opens in a new tab. A directory opens as a shell there. A file opens in your terminal editor (see [Open files in your terminal editor](/docs/configuration#open-files-in-your-terminal-editor)). Hold <kbd>⌥</kbd> to open it with its default app. The list leaves out dependency and build folders (`node_modules`, `build` and others) and hidden entries. Remote projects do not have this screen.

To open a git worktree of the project from the palette, install the **Git** extension. Its **Git Worktrees** palette opens a worktree in a new tab or a split. The **Worktrees** menu in the sidebar also opens worktrees.

## Extensions

Extensions add screens. You can install an extension from the Macterm repository, or write your own extension in `~/.config/macterm/extensions/`. Each palette of an extension is a YAML file. The output of a command becomes rows that you can search. Each row opens another screen, or runs a command in a new tab or split. For example, a Kubernetes palette goes from namespaces to pods to the logs of a pod. Each palette is in the **Palettes** section, next to the built-in screens.

See [extensions](/docs/extensions) to make one, the [palette reference](/docs/extension-palettes) for the file format, and the [examples](/docs/extension-examples) for complete palettes.

## Settings → Extensions

Settings shows every [extension](/docs/extensions) as a card in one grid that you can search by name. The grid has the extensions that you installed, in `~/.config/macterm/extensions/`. It also has the extensions in [the Macterm repository](https://github.com/macterm/macterm/tree/main/extensions) that you did not install. The installed extensions come first, and each group is in order of name. To show only one group, use the menu next to the search field: **All**, **Installed** or **Not Installed**. A card shows the name and the description of the extension. An extension can bring several palettes. Each card has one button:

- **Install** copies the folder of the extension into `~/.config/macterm/extensions/` at once. The extension is then installed like any other extension. Its commands run on your Mac, so read it first. The book button next to **Install** opens the extension on GitHub. You see every file that it installs, and its README.
- **Installed** offers to uninstall the extension. The prompt names the features that go with it, for example the **Kubernetes palette**. **Uninstall** moves its folder to the Trash.

If an extension has a file that Macterm cannot read, its card shows a warning. Macterm reads the extensions of the repository when you open the pane, at most one time each hour. They do not depend on your version of Macterm. An extension that works keeps working after every update. If an extension needs a newer Macterm, the card says so. You can install it after you update. The built-in screens (Password Manager and Files) are not extensions and are not in the list.
