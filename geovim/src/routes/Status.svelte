<script>
  import { mode } from './stores.js';
</script>

<style>
  .status-bar {
    position: absolute;
    bottom: 2em;
    left: 0;
    background: black;
    color: lime;
    font-family: monospace;
    padding: 0.25em 0.5em;
    z-index: 15;
  }
</style>

<div class="status-bar">
  mode: {$mode}
</div>
