#!/bin/bash

# --- Config ---
TITLE="GeoVim Prototype" # IMPORTANT: Change if your HTML title changes!
WAIT=1                   # Adjust this sleep time if needed (e.g., 0.8 or 1.5)

# --- Go ---
google-chrome --app="file://$HOME/_dev/geovim/index.html" &
sleep $WAIT
hyprctl dispatch togglefloating address:$(hyprctl clients -j | jq -r --arg title "$TITLE" '.[] | select(.title == $title) | .address')
