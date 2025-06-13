<script>
  import { onMount } from 'svelte';

  let mapEl;

  onMount(async () => {
    const [
      { default: Map },
      { default: View },
      { default: TileLayer },
      { default: OSM }
    ] = await Promise.all([
      import('https://cdn.jsdelivr.net/npm/ol/Map.js'),
      import('https://cdn.jsdelivr.net/npm/ol/View.js'),
      import('https://cdn.jsdelivr.net/npm/ol/layer/Tile.js'),
      import('https://cdn.jsdelivr.net/npm/ol/source/OSM.js')
    ]);

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
