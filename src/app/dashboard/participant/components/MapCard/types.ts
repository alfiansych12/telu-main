// TypeScript interfaces for MapCard and tile providers

export type MapProvider = 'openstreetmap' | 'mapbox' | 'google' | 'here';

export interface MapCardProps {
  apiProvider?: MapProvider;
  customApiKey?: string;
  center?: [number, number];
  zoom?: number;
  title?: string;
  showMarker?: boolean;
  height?: string;
}

export interface TileConfig {
  url: string;
  attribution: string;
  minZoom?: number;
  maxZoom?: number;
  errorTileUrl?: string;
}
