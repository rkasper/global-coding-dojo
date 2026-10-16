# How I Host the Global Coding Dojo 🛠️

An attendee asked what my setup looks like, so here it is. Steal anything
that's useful for running your own dojo!

## Both Formats

- 🧑‍🤝‍🧑 **Mob programming with TDD** - one driver at the keyboard, everyone else
  navigates, and we rotate every 4 minutes
- 🤖 **[Claude Code](https://claude.com/claude-code)** as our AI pair - on my
  personal Claude plan ($20/month, with extra usage enabled so we don't run
  out mid-session)
- 🦕 **TypeScript with [Deno](https://deno.com/)** - zero config, and tests are
  built in (`deno test`)
- 📁 **One folder per session** in this repo, copied from
  [new-project-template](new-project-template/) - kata requirements in the
  README, plus a source file and a test file
- 🎞️ **Slides** - a [reveal.js](https://revealjs.com/) deck per session in
  [slides/](slides/): welcome, working agreements, how the mob works, the TDD
  cycle, today's plan, and a feedback round at the end
- 📝 **Registration** on Eventbrite, and follow-up emails through MailerLite

## Online

- 📹 **[Zoom](https://zoom.us/)** (paid plan, so no 40-minute limit) - cameras
  on!
- 🤝 **[Visual Studio Code](https://code.visualstudio.com/) with
  [Live Share](https://visualstudio.microsoft.com/services/live-share/)** -
  I host the session, and each driver edits from their own VS Code
- 📜 **A prompts file instead of watching Claude's terminal** - Claude Code
  runs in a terminal panel in VS Code, but terminals look crappy to remote
  guests over Live Share. So at the start of the session we ask Claude to
  watch the session's `claude-commands.md`, and the driver gives Claude the
  mob's next prompt by adding a line to that file. Everyone can read it, and
  it doubles as a log of the session
  ([here's one](2026-09-09/claude-commands.md))
- 🔒 **An Ubuntu VM** (Parallels on my Mac) is the Live Share host.
  Terminals are read-write and the group can do anything in the VM - that's
  the point: flexibility for the group, safety for my actual computer
  - Install VS Code from Microsoft's `.deb` (it adds the apt repo for
    updates); open-source builds like VSCodium won't do, because Live
    Share needs Microsoft's build
  - The VM is logged in to my Claude and GitHub accounts, so we can use
    Claude Code and push at the end. If you copy this setup, remember that
    whatever the VM is logged in to, the whole group can use
- ⏱️ **Mob timer** - [mobtime.hadrienmp.fr](https://mobtime.hadrienmp.fr),
  inspired by the
  [Paris Coding Dojo](https://github.com/dojo-developpement-paris/dojo-developpement-paris.github.io)

## In Person (CDMX)

- 💻 **One shared laptop** - my Mac, running VS Code and Claude Code directly,
  no VM. I'm in the room watching it, and I trust people not to do anything
  dumb
- 📺 **A big screen** - the laptop goes on the venue's TV over HDMI, so the
  whole mob sees the code. The driver comes up to the keyboard each rotation
- ⏱️ **A human timekeeper** - someone volunteers, and uses their "very
  expensive stopwatch" (their phone)
