// Handles the execution logic for command-line interface commands.

import { view } from './map.js';
const fromLonLat = ol.proj.fromLonLat;

export function cmdQuit(args) {
    // placeholder for quit functionality?
    return { success: true, message: 'Quit command (no action in prototype)' };
}

export function cmdWrite(args) {
    // Placeholder for save functionality.
    return { success: true, message: 'Write command (no action in prototype)' };
}

export function cmdSet(args) {
    if (args.length === 2 && args[0].toLowerCase() === 'zoom') {
        const zoomLevel = parseFloat(args[1]);
        if (!isNaN(zoomLevel) && view && view.getMinZoom && view.getMaxZoom && zoomLevel >= view.getMinZoom() && zoomLevel <= view.getMaxZoom()) {
            view.animate({ zoom: zoomLevel, duration: 200 });
            return { success: true, message: `Zoom set to ${zoomLevel}` };
        } else {
            return { success: false, message: `Invalid zoom level: ${args[1]}`, duration: 2000, isError: true };
        }
    }
    return { success: false, message: `Unknown set command: ${args.join(' ')}`, duration: 2000, isError: true };
}

export function cmdGoto(args) {
    if (args.length === 2) {
        const lon = parseFloat(args[0]);
        const lat = parseFloat(args[1]);
        if (!isNaN(lon) && !isNaN(lat)) {
            view.animate({ center: fromLonLat([lon, lat]), duration: 500 });
            return { success: true, message: `Going to ${lat.toFixed(4)}, ${lon.toFixed(4)}` };
        } else {
            return { success: false, message: 'Invalid coordinates for goto.', duration: 2000, isError: true };
        }
    }
    return { success: false, message: 'Usage: :goto <lon> <lat>', duration: 2000, isError: true };
}

export function cmdHelp(args) {
    return { action: 'toggleHelp' };
}
