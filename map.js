// map.js
// Map setup, pan/zoom, marker logic, coordinate conversion

// OpenLayers components from global 'ol' object
const Map = ol.Map;
const View = ol.View;
const TileLayer = ol.layer.Tile;
const VectorLayer = ol.layer.Vector;
const OSM = ol.source.OSM;
const VectorSource = ol.source.Vector;
const { fromLonLat, toLonLat } = ol.proj;
const Style = ol.style.Style;
const Circle = ol.style.Circle; 
const Fill = ol.style.Fill;
const Stroke = ol.style.Stroke;

import { mapDefaults, navigation } from './config.js';
import { updateMapCoordinates } from './interface.js';

// --- Application State (specific to map) ---
export let map, view, markerSource, markerLayer;
export let markers = {};

// --- Configuration 
export const panStepFactor = navigation.panStepFactor;
export const zoomStep = navigation.zoomStep;
export const defaultZoom = mapDefaults.defaultZoom;

export function initializeMap(mapElement) {
    markerSource = new VectorSource();
    markerLayer = new VectorLayer({
        source: markerSource,
        style: new Style({
            image: new Circle({
                radius: 7,
                fill: new Fill({ color: 'rgba(255, 0, 0, 0.7)' }),
                stroke: new Stroke({ color: 'white', width: 2 }),
            }),
        }),
    });
    view = new View({
        center: fromLonLat([0, 0]),
        zoom: mapDefaults.defaultZoom,
    });

    map = new Map({
        target: mapElement,
        layers: [
            new TileLayer({ source: new OSM() }),
            markerLayer,
        ],
        view: view,
        controls: ol.control.defaults.defaults({ attributionOptions: { collapsible: false } }).extend([
            new ol.control.Zoom()
        ])
    });

    map.on('moveend', updateMapCoordinates);
}
