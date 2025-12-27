'use client'

// ...existing code...
import React, { useState } from 'react';
import MainCard from 'components/MainCard';
import CustomBreadcrumbs from 'components/@extended/CustomBreadcrumbs';

export default function ProfilePage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const profileInfo = {
    name: 'Michael Johnson',
    title: 'Senior IT Supervisor',
    email: 'michael.jhonson@eniversity.com',
    phone: '0823281729',
    unitId: 'IT001',
    location: 'Building A, Floor 3',
    status: 'Active'
  }

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    // Handle password change logic here
    alert('Password changed successfully!')
  }

  return (
    <>
      <MainCard border={false} sx={{ mb: 3, p: 0 }}>
        <CustomBreadcrumbs
          items={['Dashboard', 'Report']}
          showDate
          showExport
        />
      </MainCard>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Interface/Puti</h1>
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            Dashboard
          </div>
        </div>
      </div>

      <div className="space-y-6">

          <div className="bg-white rounded-xl shadow p-6 flex flex-col lg:flex-row gap-6 w-full">
            {/* Left: Profile Photo & Info */}
            <div className="flex flex-col items-center justify-center flex-1">
              <img
                src="/assets/images/users/user-round.png"
                alt="Profile Photo"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 mb-4"
              />
              <div className="text-2xl font-bold text-gray-800 mb-1">{profileInfo.name}</div>
              <div className="text-gray-500 mb-2">{profileInfo.title}</div>
              <div className="text-gray-600 mb-1">{profileInfo.email}</div>
              <div className="text-gray-600">{profileInfo.phone}</div>
            </div>

            {/* Right: Small Info Cards */}
            <div className="flex flex-col gap-3 flex-[1.2] min-w-[220px]">
              <div className="bg-gray-50 rounded-lg p-3 shadow flex flex-col">
                <span className="text-xs text-gray-400">Education Type</span>
                <span className="font-semibold text-gray-700">SMK</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 shadow flex flex-col">
                <span className="text-xs text-gray-400">Education Name</span>
                <span className="font-semibold text-gray-700">SMK BINA PUTRA</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 shadow flex flex-col">
                <span className="text-xs text-gray-400">Major</span>
                <span className="font-semibold text-gray-700">Rekayasa Perangkat Lunak</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 shadow flex flex-col">
                <span className="text-xs text-gray-400">Gradu Year</span>
                <span className="font-semibold text-gray-700">2025</span>
              </div>
              {/* <div className="bg-gray-50 rounded-lg p-3 shadow flex flex-col">
                <span className="text-xs text-gray-400">Description</span>
                <span className="text-gray-600">Senior IT supervisor for Building A, Floor 3</span>
              </div> */}
            </div>
          </div>

          {/* Edit Profile & Change Password Section */}
          <div className="flex flex-col md:flex-row gap-6 mt-6 w-full">
            {/* Edit Profile Card */}
            <div className="bg-white rounded-xl shadow p-6 flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={profileInfo.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileInfo.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Role</label>
                  <input
                    type="text"
                    value="Participant"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Education Type</label>
                  <input
                    type="text"
                    value={profileInfo.educationType || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Education Name</label>
                  <input
                    type="text"
                    value={profileInfo.educationName || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Major</label>
                  <input
                    type="text"
                    value={profileInfo.major || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Graduation Year</label>
                  <input
                    type="text"
                    value={profileInfo.graduationYear || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  onClick={() => alert('Edit Profile feature coming soon!')}
                >
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-white rounded-xl shadow p-6 flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handlePasswordChange}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* ...existing code... */}
          </div>
        </div>
        </div>

      {/* Account Information Section moved to bottom */}
      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Account Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={profileInfo.name}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={profileInfo.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Role</label>
            <input
              type="text"
              value="Participant"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled
            />
          </div>
        </div>
      </div>
    </>
  );
}