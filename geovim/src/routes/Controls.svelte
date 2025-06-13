<script>
  import { onMount } from 'svelte';
  import { showGraph, graphData, showHelp, command, mode } from './stores.js';

  let inputBuffer = ':';

  const commands = new Map([
    [':zoom in', () => window.dispatchEvent(new CustomEvent('geovim:zoomIn'))],
    [':zoom out', () => window.dispatchEvent(new CustomEvent('geovim:zoomOut'))],
    [':graph toggle', () => showGraph.update(v => !v)],
    [':help', () => showHelp.set(true)],
    [':help close', () => showHelp.set(false)],
    [':graph test', () => {
			showGraph.set(true);
      const data = Array.from({ length: 60 }, (_, i) => Math.sin(i / 5));
      graphData.set(data);
    }]
  ]);

  onMount(() => {
    window.addEventListener('keydown', handleKey);
  });

  function handleKey(e) {
    if ($mode === 'normal') {
      if (e.key === ':') {
        mode.set('command');
        inputBuffer = ':';
        command.set(inputBuffer);
      } else if (e.key === 'j') {
        window.dispatchEvent(new CustomEvent('geovim:pan', { detail: [0, -100000] }));
      } else if (e.key === 'k') {
        window.dispatchEvent(new CustomEvent('geovim:pan', { detail: [0, 100000] }));
      } else if (e.key === 'h') {
        window.dispatchEvent(new CustomEvent('geovim:pan', { detail: [-100000, 0] }));
      } else if (e.key === 'l') {
        window.dispatchEvent(new CustomEvent('geovim:pan', { detail: [100000, 0] }));
      }
    } else if ($mode === 'command') {
      if (e.key === 'Enter') {
        runCommand(inputBuffer);
        mode.set('normal');
        inputBuffer = ':';
        command.set(inputBuffer);
      } else if (e.key === 'Backspace') {
        inputBuffer = inputBuffer.slice(0, -1);
        command.set(inputBuffer);
      } else if (e.key === 'Escape') {
        mode.set('normal');
        inputBuffer = ':';
        command.set(inputBuffer);
      } else {
        inputBuffer += e.key;
        command.set(inputBuffer);
      }
    }
  }

  async function runCommand(cmd) {
    const handler = commands.get(cmd);
    if (handler) await handler();
    else console.warn(`Unknown command: ${cmd}`);
  }
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
      <li><strong>Esc</strong>: cancel command mode</li>
    </ul>
  </div>
{/if}
