// src/app/views/other/Participant/components/MapCard/MapCard.tsx
import React from 'react';

interface MapCardProps {
  height?: string | number;
  style?: React.CSSProperties;
}

const MapCard: React.FC<MapCardProps> = ({ height = '200px', style }) => {
  return (
    <div
      style={{
        width: '100%',
        height,
        background: '#e0e7ef',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <span style={{ color: '#888' }}>
        [Map Placeholder]
      </span>
    </div>
  );
};

export default MapCard;
