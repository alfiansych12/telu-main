import React from 'react';
import { Menu, Search } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 w-full bg-white shadow flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-4">
        <span className="text-2xl font-bold text-blue-600 tracking-tight">InternFlow Management</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">NIS: 289328320</span>
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
          />
          <Search className="absolute left-2 top-2.5 w-5 h-5 text-gray-400" />
        </div>
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </header>
  );
}
