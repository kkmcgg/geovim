// motions.js
import { view, markers } from './map.js'; 
import { mapDefaults, navigation } from './config.js'; // Import config
const fromLonLat = ol.proj.fromLonLat;

export function PanLeft() {
    const currentCenter = view.getCenter();
    const resolution = view.getResolution();
    const panAmount = resolution * navigation.panStepFactor; // Use from config
    view.animate({ center: [currentCenter[0] - panAmount, currentCenter[1]], duration: 100 });
}

export function PanRight() {
    const currentCenter = view.getCenter();
    const resolution = view.getResolution();
    const panAmount = resolution * navigation.panStepFactor; // Use from config
    view.animate({ center: [currentCenter[0] + panAmount, currentCenter[1]], duration: 100 });
}

export function PanUp() {
    const currentCenter = view.getCenter();
    const resolution = view.getResolution();
    const panAmount = resolution * navigation.panStepFactor; // Use from config
    view.animate({ center: [currentCenter[0], currentCenter[1] + panAmount], duration: 100 });
}

export function PanDown() {
    const currentCenter = view.getCenter();
    const resolution = view.getResolution();
    const panAmount = resolution * navigation.panStepFactor; // Use from config
    view.animate({ center: [currentCenter[0], currentCenter[1] - panAmount], duration: 100 });
}

export function ZoomIn() {
    const currentZoom = view.getZoom();
    view.animate({ zoom: currentZoom + navigation.zoomStep, duration: 200 }); // Use from config
}

export function ZoomOut() {
    const currentZoom = view.getZoom();
    view.animate({ zoom: currentZoom - navigation.zoomStep, duration: 200 }); // Use from config
}

export function GoHome() {
    view.animate({
        center: fromLonLat(mapDefaults.homeLocation.coordinates),
        zoom: mapDefaults.homeLocation.zoom,
        duration: 500
    });
}

export function GoWorld() {
    view.animate({
        center: fromLonLat([0, 0]), // Standard world center
        zoom: mapDefaults.worldViewZoom, // Use from config
        duration: 500
    });
}

export function SetMapView(centerLonLat, zoomLevel) {
    view.animate({
        center: fromLonLat(centerLonLat),
        zoom: zoomLevel,
        duration: 500
    });
}

export function JumpToMarker(char) {
    if (markers[char]) {
        view.animate({
            center: fromLonLat(markers[char]),
            zoom: view.getZoom(),
            duration: 500
        });
        return true;
    }
    return false;
}
