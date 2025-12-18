import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { format } from 'date-fns';

const activityItemsInit = [
  { id: 1, text: 'Team standup meeting at 9:00 AM', completed: true },
  { id: 2, text: 'Complete dashboard UI implementation', completed: true },
  { id: 3, text: 'Integrate Leaflet maps component', completed: false },
  { id: 4, text: 'Write documentation', completed: false },
];

export default function TodayAttendance() {
  const [activityItems, setActivityItems] = useState(activityItemsInit);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  const handleToggle = (id: number) => {
    setActivityItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleCheckIn = () => {
    setCheckedIn(true);
    setCheckInTime(format(new Date(), 'HH:mm'));
  };

  const completedCount = activityItems.filter((i) => i.completed).length;
  const progress = Math.round((completedCount / activityItems.length) * 100);

  return (
    <Card>
      <div className="mb-2 text-gray-700 font-semibold text-lg">
        Today's Attendance - {format(new Date(), 'EEE, MMM d yyyy')}
      </div>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-500">{progress}%</span>
        </div>
        <ul className="space-y-2">
          {activityItems.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => handleToggle(item.id)}
                className="accent-blue-600 w-4 h-4 rounded"
              />
              <span className={item.completed ? 'line-through text-gray-400' : ''}>{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <Button
        variant="primary"
        className="w-full mt-4 text-lg py-3"
        onClick={handleCheckIn}
        disabled={checkedIn}
      >
        {checkedIn && checkInTime
          ? `Checked In at ${checkInTime}`
          : 'Check In Now'}
      </Button>
    </Card>
  );
}
