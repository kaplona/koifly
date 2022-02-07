import frontendAssets from '../frontend-assets';

const mapConstants = {
  GOOGLE_MAPS_API_KEY: frontendAssets.googleMapsApiKey,
  ZOOM_LEVEL: {
    world: 4,
    region: 6,
    site: 10,
    track: 13
  },
  CENTER: {
    world: frontendAssets.mapCenters.world,
    region: frontendAssets.mapCenters.region
  },
  INFOWINDOW_WIDTH: 250,
  OUT_OF_MAP_COORDINATES: { lat: 90, lng: 0 },
  UNKNOWN_ADDRESS: 'unknown address',
  UNKNOWN_ELEVATION: 'unknown elevation'
};


export default mapConstants;
