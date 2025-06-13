<script>
  import { command } from './stores.js';
</script>

<style>
  #command {
    position: absolute;
    bottom: 0;
    width: 100%;
    background: black;
    color: lime;
    font-family: monospace;
    padding: 0.5em;
    z-index: 10;
  }
</style>

<div id="command">{$command}</div>