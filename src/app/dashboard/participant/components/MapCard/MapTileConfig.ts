// Tile provider configuration for MapCard
import { TileConfig, MapProvider } from './types';

// Get environment variables
const MAPBOX_API_KEY = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;
const MAPBOX_USERNAME = process.env.NEXT_PUBLIC_MAPBOX_USERNAME;
const MAPBOX_STYLE_ID = process.env.NEXT_PUBLIC_MAPBOX_STYLE_ID;

export const getTileConfig = (provider: MapProvider = 'openstreetmap'): TileConfig => {
  switch (provider) {
    case 'mapbox': {
      if (!MAPBOX_API_KEY || !MAPBOX_USERNAME || !MAPBOX_STYLE_ID) {
        return {
          url: '',
          attribution: 'Mapbox config missing. Check your .env.local',
        };
      }
      return {
        url: `https://api.mapbox.com/styles/v1/${MAPBOX_USERNAME}/${MAPBOX_STYLE_ID}/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_API_KEY}`,
        attribution:
          '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      };
    }
    // Add more providers here if needed
    case 'openstreetmap':
    default:
      return {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      };
  }
};
