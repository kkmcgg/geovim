# geovim

GeoVim is a web-based map application with Vim-like keyboard controls.

This is the (non working) svelte version

Try it out: [https://kkmcgg.github.io/geovim](https://kkmcgg.github.io/geovim)

## Build
To build the project, run the following command:

```bash
npm run build
npm run preview
```

## Modes

* **NORMAL Mode:** Default mode for navigation and commands.
* **COMMAND_LINE Mode:** Enter by pressing `:` in NORMAL mode. Type commands and press `Enter` to execute. `Esc` returns to NORMAL mode.
* **INSERT Mode:** (Placeholder) Enter with `i`. `Esc` returns to NORMAL mode.
* **VISUAL Mode:** (Placeholder) Enter with `v`. `Esc` returns to NORMAL mode.

## General Controls (NORMAL Mode)

* `?`: Toggle Help Panel
* `Esc`: Clear current command buffer / Cancel pending command / Close Help Panel

## Navigation (NORMAL Mode)

* **Pan:**
  * `h`: Pan Left
  * `j`: Pan Down
  * `k`: Pan Up
  * `l`: Pan Right
  * `w`: Pan Word Right (Large Pan)
  * `b`: Pan Word Left (Large Pan)
* **Zoom:**
  * `+` or `=`: Zoom In
  * `-`: Zoom Out
  * `zi`: Zoom In (Vim style)
  * `zo`: Zoom Out (Vim style)
  * `zz`: Center map and set zoom to a moderate level (10)
* **Go To:**
  * `gg`: Go To Top (World View - 0,0 coordinates, default zoom)
  * `G`: Go To "Home" (Predefined location - Nova Scotia)

## Markers (NORMAL Mode)

* `m{char}` (e.g., `ma`, `mb`): Set marker `{char}` (a-z) at the current map center.
* `'{char}` (e.g., `'a`, `'b`): Go to marker `{char}`.

## Command Line Mode (enter with `:`)

* `:set zoom <level>`: Set map zoom to `<level>` (e.g., `:set zoom 12`).
* `:goto <lon> <lat>`: Go to specified longitude and latitude (e.g., `:goto -71.05 42.36`).
* `:help`: Show the help panel.
* `:q` or `:quit`: Quit (placeholder).
* `:w` or `:write`: Write/Save (placeholder).
* `Enter`: Execute the typed command.
* `Esc`: Exit Command Line Mode and return to NORMAL mode.
