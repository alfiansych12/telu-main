import React, { useState } from 'react';
import { CheckSquare, BarChart2, Settings } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { label: 'Dashboard', icon: <CheckSquare />, active: true },
  { label: 'Profit', icon: <BarChart2 />, active: false },
  { label: 'Settings', icon: <Settings />, active: false },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);

  return (
    <aside
      className={clsx(
        'bg-white shadow-lg h-[calc(100vh-64px)] sticky top-[64px] z-20 transition-all duration-300',
        expanded ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex flex-col h-full">
        <button
          className="p-2 m-2 rounded hover:bg-gray-100 self-end"
          onClick={() => setExpanded((e) => !e)}
          aria-label="Toggle sidebar"
        >
          <span className="text-gray-400">{expanded ? '<' : '>'}</span>
        </button>
        <nav className="flex-1 flex flex-col gap-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={clsx(
                'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                item.active
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <span className="w-6 h-6">{item.icon}</span>
              {expanded && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
