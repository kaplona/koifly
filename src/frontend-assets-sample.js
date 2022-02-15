'use strict';

const frontendAssets = {
  // Your google-maps-api key to access Google Maps JavaScript, Elevation and Geocoding APIs.
  // Required to see maps in the UI.
  googleMapsApiKey: 'key',

  // Replace with your home site coordinates,
  // they will be used as a fallback if a map doesn't have any site or flight track to display.
  mapCenters: {
    world: { lat: 48.693829, lng: -98.893716 }, // USA
    region: { lat: 49.2827291, lng: -123.1207375 } // Vancouver
  }
};

module.exports = frontendAssets;
