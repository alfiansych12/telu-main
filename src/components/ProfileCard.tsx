import React from 'react';

interface ProfileCardProps {
  profile: {
    name: string;
    title: string;
    email: string;
    phone: string;
    unitId: string;
    location: string;
    status: string;
  };
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => (
  <div className="border rounded-lg p-4 bg-gray-50">
    <div className="mb-2 text-lg font-semibold text-gray-800">{profile.name}</div>
    <div className="mb-1 text-gray-600">{profile.title}</div>
    <div className="mb-1 text-gray-600">Email: {profile.email}</div>
    <div className="mb-1 text-gray-600">Phone: {profile.phone}</div>
    <div className="mb-1 text-gray-600">Unit ID: {profile.unitId}</div>
    <div className="mb-1 text-gray-600">Location: {profile.location}</div>
    <div className="mb-1 text-gray-600">Status: {profile.status}</div>
  </div>
);

export default ProfileCard;
