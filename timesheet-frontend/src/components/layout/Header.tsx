"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useState, useEffect } from "react";
import Avatar from "../ui/Avatar";

export default function Header() {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.email) {
        try {
          const response = await fetch(`http://localhost:3001/api/employees/by-email?email=${user.email}`);
          const data = await response.json();
          setProfileData(data);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  // Get profile photo URL
  const getProfilePhotoUrl = () => {
    if (profileData?.profile?.employeePhotoUrl) {
      return `http://localhost:3001${profileData.profile.employeePhotoUrl}`;
    }
    return undefined;
  };

  return (
    <header className="flex justify-between items-center bg-white px-6 py-4 border-b">
      <div className="flex items-center gap-4">
        <Avatar 
          name={user?.name || ''} 
          size="sm" 
          src={getProfilePhotoUrl()}
        />
        <div>
          <h2 className="font-semibold text-lg">Welcome, {user?.name}</h2>
          <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
        </div>
      </div>

      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </header>
  );
}