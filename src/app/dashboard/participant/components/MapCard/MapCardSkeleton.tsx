import React from 'react';

export default function MapCardSkeleton({ height = '300px' }: { height?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-3 animate-pulse" style={{ height }}>
      <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
      <div className="h-full bg-gray-100 rounded-lg"></div>
      <div className="h-4 w-2/3 bg-gray-200 rounded mt-4"></div>
    </div>
  );
}
