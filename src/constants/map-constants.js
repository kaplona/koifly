'use strict';


const MapConstants = {

  ZOOM_LEVEL: {
    world: 4,
    region: 6,
    site: 10,
    track: 13
  },

  CENTER: {
    world: {lat: 48.693829, lng: -98.893716}, // USA
    region: {lat: 49.2827291, lng: -123.1207375} // Vancouver
  },

  INFOWINDOW_WIDTH: 250,

  OUT_OF_MAP_COORDINATES: {lat: 90, lng: 0},

  UNKNOWN_ADDRESS: 'unknown address',

  UNKNOWN_ELEVATION: 'unknown elevation'
};


module.exports = MapConstants;
