import React from 'react';

export interface ChecklistItem {
  label: string;
  checked: boolean;
}

interface AttendanceChecklistProps {
  items: ChecklistItem[];
  onToggle: (index: number) => void;
}

const AttendanceChecklist: React.FC<AttendanceChecklistProps> = ({ items, onToggle }) => (
  <div className="flex flex-col gap-2 mb-6">
    {items.map((item, idx) => (
      <label key={item.label} className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={item.checked}
          onChange={() => onToggle(idx)}
          className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-400"
          aria-checked={item.checked}
          aria-label={item.label}
        />
        <span className="text-base text-gray-800">{item.label}</span>
      </label>
    ))}
  </div>
);

export default AttendanceChecklist;
