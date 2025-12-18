'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import Card from './ui/Card';

// Fix for Leaflet marker icons in Next.js
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
if (typeof window !== 'undefined' && L.Icon.Default) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x.src || markerIcon2x,
    iconUrl: markerIcon.src || markerIcon,
    shadowUrl: markerShadow.src || markerShadow,
  });
}

interface MapCardProps {
  location?: [number, number];
  title?: string;
  height?: string;
}

export default function MapCard({ 
  location = [-6.2088, 106.8456], 
  title = "Attendance Location",
  height = "300px" 
}: MapCardProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    setIsClient(true);
    setMapKey(prev => prev + 1);
  }, []);

  if (!isClient) {
    return (
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className={`h-[${height}] bg-gray-100 animate-pulse rounded-lg`}></div>
        <div className="mt-4 h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">Real-time location tracking</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
          Live
        </div>
      </div>
      <div className={`h-[${height}] rounded-lg overflow-hidden border border-gray-200`} key={mapKey}>
        <MapContainer
          center={location}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          className="rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={location}>
            <Popup>
              <div className="p-2">
                <div className="font-semibold text-gray-900">Your Current Location</div>
                <div className="text-sm text-gray-600 mt-1">Attendance recorded here</div>
                <div className="text-xs text-gray-500 mt-2">
                  Lat: {location[0].toFixed(4)}, Lng: {location[1].toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Coordinates: {location[0].toFixed(4)}, {location[1].toFixed(4)}
        </div>
        <div className="text-sm text-blue-600 font-medium">
          Zoom: 13x • OpenStreetMap
        </div>
      </div>
    </Card>
  );
}
