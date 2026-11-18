<!-- page:
slug: remote-projects
title: Remote projects
nav: Remote projects
group: Projects & sessions
description: Projects on a remote machine over SSH. The panes keep running on the host when you quit, when the connection drops and when you restart your Mac.
-->

# Remote projects

A remote project is a project whose folder is on another machine. Each pane is a session of Macterm's server, which runs **on that host**. All panes of a host use one SSH connection, so you log in one time for each host. Your shells, processes and scrollback keep running when you quit Macterm, when the connection drops and when you restart your Mac.

## Requirements

**SSH access to the host.** Anything that works for `ssh` works here. When the login asks for a password, a passphrase or a new host key, Macterm asks you in a sheet.

**Linux (x86_64 or aarch64) or macOS on the host.** At the first connection to a host, Macterm asks to install its server there, in `~/.local/share/macterm`. The server comes from Macterm, not from the internet of the host, and the host checks its checksum. Later versions install with no question.

If you choose **Continue Without Server**, each pane is a plain SSH shell. It ends when the connection stops, and its tab shows no program name. The project's row in the sidebar shows a mark (an exclamation point in a circle). Put the pointer on the mark to see the reason. To install the server later, open the menu of the project in **Settings → Projects** and choose **Install Server on Host…**. A host with no build (for example, BSD) also gets plain shells.

**Windows hosts are not supported.** When the SSH shell of the host is `cmd.exe` or PowerShell, the pane says that the host runs Windows and that Macterm does not support it.

**Connection settings come from `~/.ssh/config`.** They never come from Macterm. Define a `Host` alias and use the alias as the host of the project. When your config has a `ControlMaster` that is running, Macterm uses it and logs in to nothing.

```text title="~/.ssh/config"
Host devbox
  HostName dev.example.com
  User deploy
  Port 2222
  IdentityFile ~/.ssh/id_ed25519
```

## Creating one

Go to **Sidebar → + → Remote Machine…**

| Field | Value |
| --- | --- |
| **Host** | `devbox`, `user@host` or any alias from your ssh config |
| **Directory** | `~/dev/api`, `/srv/app`, or a path that is relative to the remote home |

You can also type `devbox:~/dev/api` in the command palette (<kbd>⌘P</kbd>) and select **Add remote project**. The same sheet opens with the fields filled in, and the check below starts at once.

Before Macterm adds the project, it connects to the host and checks that the folder is there. This is the first connection, so the login and the question about the server come now. If the folder is not on the host, or if the host does not answer, Macterm adds no project and tells you why. `macterm project create devbox:~/dev/api` does the same check.

If the folder of a project that you already have is removed later, a new pane starts in the home folder and shows one `macterm:` line.

## How panes behave

| Action | Effect |
|---|---|
| New tab or split | A new session starts on the host, in the project directory. |
| Quit Macterm | The sessions keep running on the host. |
| Start Macterm again | Every pane connects to its session again, with its scrollback and processes. |
| Close a pane or tab | Its session on the host ends. Macterm asks you first if a program is running. |
| The shell in a pane exits | The pane closes. |
| Restart your Mac, or the network drops | The sessions keep running. The panes that lost the connection connect again. |
| The host restarts | The sessions on the host end. Each pane says so. Press Return to start a new shell in the same folder. |

A pane that lost its connection keeps its last screen, blurred and dimmed. Macterm connects it again when the Mac wakes, when the network changes, when you return to the app, when you select the project, and when you log in to its host from another pane. Press a key in the pane to connect at once. To connect only when you press a key, turn off **Settings → General → Remote Projects → Reconnect panes after a dropped connection**.

When a connection fails, the pane says why, for example `No host is named devbox.` or `devbox does not answer.` Press a key to try again.

### The roaming link

After the first connection, Macterm opens a second path to the host over UDP. If it works, a pane comes back after sleep or a new network with no login and no prompt. It uses a port from 60001 to 60999 on the host. Macterm opens the port only while a link is up. If UDP does not get through, nothing changes: the panes use ssh.

The link does not work for a host that you reach through `ProxyJump` or `ProxyCommand`. To turn it off for one host, set `MACTERM_LINK=off` in the environment of its server. To limit its ports, set `MACTERM_LINK_PORTS=first-last`. Macterm never changes a firewall: if the host has one, open the ports.

A link that hears nothing for 5 minutes of awake time ends. Its panes then connect again with ssh.

### Tab names and busy panes

Macterm names a remote tab after the program that runs in it, shows the logo of a coding agent, and asks before it closes a pane whose program still runs. The server on the host tells the pane about each change of its foreground process, through the connection of the pane itself. The name follows the host at once.

## Project Insights on a host

[Project Insights](/docs/project-insights) records a command in a remote project only if the shell on the host sends prompt marks (OSC 133). Macterm does not turn on shell integration on the host. If the shell sends no marks, Project Insights records nothing for that project. The tab names, the busy dots and the confirmation before you close a pane do not depend on marks: they still work.

If your shell on the host does not send the marks, add the lines below to the end of its rc file. Do not add them to a shell that already sends marks (fish 4 or later does): Macterm would see each mark twice. A prompt tool that rebuilds `PS1` at each prompt, such as Starship in bash, removes the marks from bash.

For bash 4.4 or later, add these lines to `~/.bashrc` on the host. Macterm starts a login shell, so make sure your login profile loads `~/.bashrc`.

```bash
__macterm_mark_d() { local s=$?; printf '\e]133;D;%s\a' "$s"; return "$s"; }
PROMPT_COMMAND="__macterm_mark_d${PROMPT_COMMAND:+;$PROMPT_COMMAND}"
PS1='\[\e]133;A\a\]'"$PS1"'\[\e]133;B\a\]'
PS0='\e]133;C\a'
```

For zsh, add these lines to `~/.zshrc` on the host:

```zsh
autoload -Uz add-zsh-hook
__macterm_precmd() { print -n "\e]133;D;$?\a"; }
__macterm_preexec() { print -n "\e]133;C\a"; }
add-zsh-hook precmd __macterm_precmd
add-zsh-hook preexec __macterm_preexec
PS1=$'%{\e]133;A\a%}'"$PS1"$'%{\e]133;B\a%}'
```

Open a new tab to use the change. The lines were tested on Debian 12 with bash 5.2 and zsh 5.9. Each prompt and each command sent `133;A`, `133;B`, `133;C` and `133;D` with the exit code. In both shells, the first prompt also sends a `133;D;0` before any command. The test checked the marks in a pty. It did not check Macterm's records.

## Layouts

[Declarative layouts](/docs/declarative-layouts) work with no change. The `cwd` of each pane and `~` resolve on the remote side.

```yaml title="~/.config/macterm/projects/api.yaml"
name: "API (devbox)"
path: "devbox:~/dev/api"
tabs:
  - run: "npm run dev"
  - name: "Logs"
    cwd: "logs"
```

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `macterm: cannot cd to …` | The directory does not exist on the host. The session starts in your home directory. |
| An agent shows its logo but never its busy or done dot | The session of the tab started before Macterm began to tell the host that it runs in Ghostty. Agents need this before they report progress. Open a new tab or pane for the agent. |

## Sessions from Macterm 1

Macterm 1 ran a zmx session on the host for each pane. Macterm 2 does not use them: at the first start, each remote pane starts a new session in the project directory. The old sessions keep running on the host. To see and end them, run `zmx ls` and `zmx kill` on the host.

## Limitations

- A session whose pane you close while the host is not connected stays on the host.
- **Replace Project Path with Current Dir** and other local-directory features are off.
- A session keeps the environment from the time when Macterm created it. After you upgrade Macterm, an existing remote tab does not get new variables (for example, the variable that lets agents report progress). Open a new tab or pane instead.
