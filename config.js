// Application-wide configuration settings

export const mapDefaults = {
    defaultZoom: 3,
    homeLocation: {
        coordinates: [-63.5, 45], // Lon, Lat for Nova Scotia
        zoom: 6
    },
    worldViewZoom: 2 
};

export const navigation = {
    panStepFactor: 64, // In pixels worth of map units
    zoomStep: 1
};

export const ui = {
    defaultMessageDuration: 3000 // Milliseconds
};
