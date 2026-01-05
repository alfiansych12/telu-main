'use client';
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


// Custom icon for User Location (Blue Dot)
const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom icon for Admin Set Location (Red Dot)
const adminIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Default Icon Fix using CDN
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapMarker {
    position: [number, number];
    title: string;
    subtitle?: string;
    type?: 'user' | 'admin';
}

interface MapComponentProps {
    position: [number, number];
    address: string;
    userPosition?: [number, number] | null;
    radius?: number;
    markers?: MapMarker[];
}

const MapComponent: React.FC<MapComponentProps> = ({
    position,
    address,
    userPosition,
    radius = 100,
    markers = []
}) => {
    return (
        <MapContainer center={userPosition || position} zoom={16} style={{ width: '100%', height: '100%' }} scrollWheelZoom={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Admin Set Location (Main Marker) - ALWAYS SHOW for Supervisor */}
            <>
                <Marker position={position} icon={adminIcon}>
                    <Popup>
                        <strong>Designated Area</strong><br />
                        {address}
                    </Popup>
                </Marker>
                <Circle
                    center={position}
                    radius={radius}
                    pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1 }}
                />
            </>

            {/* Render dynamically passed markers */}
            {markers.map((marker, index) => (
                <Marker
                    key={index}
                    position={marker.position}
                    icon={marker.type === 'admin' ? adminIcon : userIcon}
                >
                    <Popup>
                        <div style={{ padding: '4px', minWidth: 160, textAlign: 'center' }}>
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                backgroundColor: marker.type === 'admin' ? '#f44336' : '#2196f3',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 8px',
                                fontWeight: 'bold',
                                fontSize: '1.2rem',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}>
                                {marker.title.charAt(0)}
                            </div>
                            <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: '2px' }}>{marker.title}</strong>
                            {marker.subtitle && (
                                <span style={{ fontSize: '0.75rem', color: '#666', display: 'block' }}>
                                    {marker.subtitle}
                                </span>
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Individual User Current Location (for Individual Dashboard) */}
            {userPosition && !markers.length && (
                <Marker position={userPosition} icon={userIcon}>
                    <Popup>
                        <strong>Your Location</strong><br />
                        You are currently here.
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default MapComponent;
