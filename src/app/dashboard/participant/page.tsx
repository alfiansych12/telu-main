import Header from './components/Header';
import Sidebar from './components/Sidebar';
import StatsCards from './components/StatsCards';
import TodayAttendance from './components/TodayAttendance';
import MapCard from './components/MapCard';
import HistoryTable from './components/HistoryTable';

export default function ParticipantDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Stats Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
            <StatsCards />
          </div>
          {/* Grid Layout for Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <TodayAttendance />
              <HistoryTable />
            </div>
            {/* Right Column - MAP CARD */}
            <div className="space-y-6">
              <MapCard />
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                {/* Quick action buttons */}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
