<script>
  import { graphData } from './stores.js';
  import { onMount } from 'svelte';

  let graphEl;
  let Plotly;
  let PlotlyLoaded = false;

  onMount(async () => {
    if (!PlotlyLoaded) {
      try {
        await import('https://cdnjs.cloudflare.com/ajax/libs/plotly.js/3.0.1/plotly.min.js');
        Plotly = window.Plotly;
        PlotlyLoaded = true;
        updateGraph();
      } catch (err) {
        console.error('Failed to load Plotly:', err);
      }
    }
  });

  $: if (PlotlyLoaded && $graphData.length && graphEl) {
    updateGraph();
  }

  function updateGraph() {
    if (Plotly && Plotly.newPlot && graphEl && $graphData.length) {
      Plotly.newPlot(graphEl, [{ y: $graphData }], {
        margin: { t: 20 },
        paper_bgcolor: 'black',
        plot_bgcolor: 'black',
        font: { color: 'lime' }
      });
    }
  }
</script>

<style>
  #graph {
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 150px;
    background: black;
    border: 1px solid lime;
    z-index: 10;
  }
</style>

<div id="graph" bind:this={graphEl}></div>
