'use client';
import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for leaflet default icon issues in Next.js
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });
}

interface MapPickerComponentProps {
    position: [number, number];
    radius: number;
    onPositionChange: (lat: number, lng: number) => void;
}

const LocationMarker = ({ position, radius, onPositionChange }: MapPickerComponentProps) => {
    useMapEvents({
        click(e) {
            onPositionChange(e.latlng.lat, e.latlng.lng);
        },
    });

    return (
        <>
            <Marker position={position} />
            <Circle center={position} radius={radius} pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }} />
        </>
    );
};

const MapPickerComponent: React.FC<MapPickerComponentProps> = ({ position, radius, onPositionChange }) => {
    return (
        <MapContainer
            center={position}
            zoom={15}
            style={{ width: '100%', height: '400px', borderRadius: '8px' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} radius={radius} onPositionChange={onPositionChange} />
        </MapContainer>
    );
};

export default MapPickerComponent;
