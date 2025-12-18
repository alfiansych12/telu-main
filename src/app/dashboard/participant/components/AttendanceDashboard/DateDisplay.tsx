import React from 'react';
import { format } from 'date-fns';

const DateDisplay: React.FC = () => {
  const now = new Date();
  const formatted = format(now, "EEEE, MMMM d, yyyy");
  return (
    <div className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
      Today's Attendance - {formatted}
    </div>
  );
};

export default DateDisplay;
