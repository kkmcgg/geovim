<script>
  import Map from './Map.svelte';
  import Console from './Console.svelte';
  import Graph from './Graph.svelte';
  import Controls from './Controls.svelte';
  import Status from './Status.svelte';
  import { showGraph, showHelp } from './stores.js';
</script>

<style>
  #help {
    position: absolute;
    top: 10%;
    left: 10%;
    width: 80%;
    background: rgba(0, 0, 0, 0.9);
    color: lime;
    font-family: monospace;
    padding: 1em;
    border: 1px solid lime;
    z-index: 20;
  }
</style>

<Map />
<Console />
<Controls />
<Status />

{#if $showGraph}
  <Graph />
{/if}
{#if $showHelp}
  <div id="help">
    <h3>GeoVim Help</h3>
    <ul>
      <li><strong>h/j/k/l</strong>: pan west/south/north/east</li>
      <li><strong>:zoom in</strong>, <strong>:zoom out</strong>: change zoom</li>
      <li><strong>:graph toggle</strong>: show/hide graph</li>
      <li><strong>:graph test</strong>: draw test graph</li>
      <li><strong>:help</strong>: open this help</li>
      <li><strong>:help close</strong>: close help</li>
    </ul>
  </div>
{/if}
