import 'leaflet/dist/leaflet.css';
import React from 'react';

export default function DashboardParticipantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
