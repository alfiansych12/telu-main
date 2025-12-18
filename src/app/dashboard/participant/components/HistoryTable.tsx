import React from 'react';
import Card from './ui/Card';
import Badge from './ui/Badge';

const attendanceData = [
  {
    date: '2025-11-20',
    day: 'Thursday',
    checkIn: '08:30 AM',
    checkOut: '05:15 PM',
    workingHours: '8h 45m',
    status: 'present',
    activityPlan: 'Project Meeting, Code Review',
  },
  {
    date: '2025-11-19',
    day: 'Wednesday',
    checkIn: '08:45 AM',
    checkOut: '05:00 PM',
    workingHours: '8h 15m',
    status: 'late',
    activityPlan: 'UI Review, Standup',
  },
  {
    date: '2025-11-18',
    day: 'Tuesday',
    checkIn: '-',
    checkOut: '-',
    workingHours: '-',
    status: 'absent',
    activityPlan: '-',
  },
  {
    date: '2025-11-17',
    day: 'Monday',
    checkIn: '08:20 AM',
    checkOut: '05:10 PM',
    workingHours: '8h 50m',
    status: 'present',
    activityPlan: 'Planning, Coding',
  },
  {
    date: '2025-11-16',
    day: 'Sunday',
    checkIn: '-',
    checkOut: '-',
    workingHours: '-',
    status: 'absent',
    activityPlan: '-',
  },
];

const statusColor = {
  present: 'green',
  absent: 'red',
  late: 'yellow',
};

export default function HistoryTable() {
  return (
    <Card>
      <div className="mb-4 text-lg font-semibold text-gray-900">Attendance History</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">DATE</th>
              <th className="px-4 py-2 text-left">DAY</th>
              <th className="px-4 py-2 text-left">CHECK IN</th>
              <th className="px-4 py-2 text-left">CHECK OUT</th>
              <th className="px-4 py-2 text-left">WORKING HOURS</th>
              <th className="px-4 py-2 text-left">STATUS</th>
              <th className="px-4 py-2 text-left">ACTIVITY PLAN</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((row, idx) => (
              <tr
                key={row.date}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="px-4 py-2 whitespace-nowrap">{row.date}</td>
                <td className="px-4 py-2 whitespace-nowrap">{row.day}</td>
                <td className="px-4 py-2 whitespace-nowrap">{row.checkIn}</td>
                <td className="px-4 py-2 whitespace-nowrap">{row.checkOut}</td>
                <td className="px-4 py-2 whitespace-nowrap">{row.workingHours}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <Badge color={statusColor[row.status as keyof typeof statusColor]}>
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                  </Badge>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">{row.activityPlan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
