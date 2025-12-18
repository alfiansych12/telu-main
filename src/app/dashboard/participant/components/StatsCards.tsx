import React from 'react';
import { UserMinus, LogIn, LogOut } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Absence Card */}
      <Card className="flex items-center gap-4">
        <div className="p-3 bg-red-50 rounded-lg">
          <UserMinus className="w-8 h-8 text-red-600" />
        </div>
        <div>
          <div className="text-gray-500 text-sm font-medium">Absence</div>
          <div className="text-3xl font-bold text-gray-900">3</div>
        </div>
      </Card>
      {/* Disbboard Card */}
      <Card className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-gray-500 text-sm font-medium">Disbboard</div>
        </div>
        <div className="flex gap-3 mt-2">
          <Button variant="primary">Check In</Button>
          <Button variant="secondary">Check Out</Button>
        </div>
        <div className="mt-2 text-xs text-green-600 font-semibold">Status: Ready</div>
      </Card>
    </div>
  );
}
