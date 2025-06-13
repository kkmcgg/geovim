// actions.js
import { view, markerSource, markers } from './map.js';
const fromLonLat = ol.proj.fromLonLat;
const toLonLat = ol.proj.toLonLat;
const Feature = ol.Feature;
const Point = ol.geom.Point;

export function SetMarker(char) {
    const center = toLonLat(view.getCenter());
    markers[char] = center;
    const markerFeature = new Feature({ geometry: new Point(fromLonLat(center)) });
    markerFeature.setId(`marker_${char}`);
    const existing = markerSource.getFeatureById(`marker_${char}`);
    if (existing) markerSource.removeFeature(existing);
    markerSource.addFeature(markerFeature);
    return center;
}
