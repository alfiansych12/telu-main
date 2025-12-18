// MapCard.tsx - Card with interactive map and API key support
'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapCardProps, MapProvider } from './types';
import { getTileConfig } from './MapTileConfig';
import MapCardSkeleton from './MapCardSkeleton';
import { MapPin } from 'lucide-react';

// Fix for Leaflet marker icons in Next.js
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

if (typeof window !== 'undefined' && L.Icon.Default) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x.src || markerIcon2x,
    iconUrl: markerIcon.src || markerIcon,
    shadowUrl: markerShadow.src || markerShadow,
  });
}

const DEFAULT_CENTER: [number, number] = [-6.2088, 106.8456];
const DEFAULT_ZOOM = 13;

function CoordinatesDisplay({ position }: { position: [number, number] }) {
  return (
    <div className="absolute bottom-3 right-3 bg-white/80 px-3 py-1 rounded shadow text-xs text-gray-700">
      Lat: {position[0].toFixed(5)}, Lng: {position[1].toFixed(5)}
    </div>
  );
}

export default function MapCard({
  apiProvider,
  customApiKey,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  title = 'Attendance Location Map',
  showMarker = true,
  height = '100%',
  style = {},
}: MapCardProps & { style?: React.CSSProperties }) {
  const [isClient, setIsClient] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<[number, number]>(center);
  const [loading, setLoading] = useState(true);

  // Determine provider from env or prop
  const provider: MapProvider = apiProvider || (process.env.NEXT_PUBLIC_MAP_PROVIDER as MapProvider) || 'openstreetmap';
  const tileConfig = getTileConfig(provider);

  // Error if tileConfig.url is empty (e.g. missing API key)
  useEffect(() => {
    setIsClient(true);
    setMapKey((prev) => prev + 1);
    if (!tileConfig.url) {
      setError('Tile provider configuration missing or invalid API key.');
    }
  }, [provider, tileConfig.url]);

  // Map events for coordinate display
  function MapEvents() {
    useMapEvents({
      moveend: (e) => {
        setPosition([e.target.getCenter().lat, e.target.getCenter().lng]);
      },
      dragend: (e) => {
        setPosition([e.target.getCenter().lat, e.target.getCenter().lng]);
      },
    });
    return null;
  }

  // Retry handler
  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    setMapKey((prev) => prev + 1);
  }, []);

  if (!isClient) {
    return <MapCardSkeleton height={height} />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-3 items-center justify-center" style={{ height }}>
        <div className="flex items-center gap-2 text-red-600 font-semibold">
          <MapPin className="w-6 h-6" />
          {error}
        </div>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          onClick={handleRetry}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative w-full"
      style={{
        width: '100%',
        height: '100%',
        minHeight: 200,
        aspectRatio: typeof window !== 'undefined' && window.innerWidth <= 480 ? '1/1' : '4/3',
        ...style,
      }}
      key={mapKey}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%', borderRadius: 12 }}
        zoomControl={false}
        whenReady={() => setLoading(false)}
      >
        <TileLayer
          url={tileConfig.url}
          attribution={tileConfig.attribution}
          maxZoom={tileConfig.maxZoom}
          minZoom={tileConfig.minZoom}
          errorTileUrl={tileConfig.errorTileUrl}
          eventHandlers={{
            tileerror: () => setError('Failed to load map tiles. Please check your API key or network.'),
          }}
        />
        {showMarker && (
          <Marker position={center}>
            <Popup>
              <div className="font-semibold">Current Location</div>
              <div className="text-xs text-gray-600">Lat: {center[0]}, Lng: {center[1]}</div>
            </Popup>
          </Marker>
        )}
        <ZoomControl position="bottomright" />
        <MapEvents />
      </MapContainer>
      <CoordinatesDisplay position={position} />
      {loading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><MapCardSkeleton height="220px" /></div>}
    </div>
  );
}

// ---
// ENVIRONMENT SETUP EXAMPLE (add to .env.local):
// NEXT_PUBLIC_MAP_PROVIDER=mapbox
// NEXT_PUBLIC_MAPBOX_API_KEY=pk.your_key_here
// NEXT_PUBLIC_MAPBOX_USERNAME=your_username
// NEXT_PUBLIC_MAPBOX_STYLE_ID=your_style_id
// ---
