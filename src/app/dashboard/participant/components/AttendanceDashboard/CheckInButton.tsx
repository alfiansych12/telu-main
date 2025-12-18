import React from 'react';


interface CheckInButtonProps {
  checkedIn: boolean;
  onCheckIn: () => void;
  loading?: boolean;
}

const CheckInButton: React.FC<CheckInButtonProps> = ({ checkedIn, onCheckIn, loading }) => (
  <button
    className={`w-full py-3 mt-2 rounded-lg font-bold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
      ${checkedIn ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
    onClick={onCheckIn}
    disabled={checkedIn || loading}
    aria-disabled={checkedIn || loading}
    type="button"
    style={{ backgroundColor: checkedIn ? '#9ca3af' : '#3b82f6', color: checkedIn ? '#6b7280' : '#fff' }}
  >
    {loading ? 'Processing...' : checkedIn ? 'Already Checked In' : 'Check in Now'}
  </button>
);

export default CheckInButton;
