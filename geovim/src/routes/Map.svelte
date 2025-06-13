<script>
  import { onMount } from 'svelte';
  import Map from 'ol/Map.js';
  import View from 'ol/View.js';
  import TileLayer from 'ol/layer/Tile.js';
  import OSM from 'ol/source/OSM.js';

  let mapEl;

  onMount(() => {
    const osmSource = new OSM();
    osmSource.setAttributions([]);

    const map = new Map({
      target: mapEl,
      controls: [],
      layers: [new TileLayer({ source: osmSource })],
      view: new View({ center: [0, 0], zoom: 2 })
    });

    window.addEventListener('geovim:zoomIn', () => {
      const view = map.getView();
      view.setZoom(view.getZoom() + 1);
    });

    window.addEventListener('geovim:zoomOut', () => {
      const view = map.getView();
      view.setZoom(view.getZoom() - 1);
    });

    window.addEventListener('geovim:pan', (e) => {
      const [dx, dy] = e.detail;
      const view = map.getView();
      const center = view.getCenter();
      view.setCenter([center[0] + dx, center[1] + dy]);
    });
  });
</script>

<style>
  #map {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
  }
</style>

<div id="map" bind:this={mapEl}></div>
