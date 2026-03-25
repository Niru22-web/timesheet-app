"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await api.get(`/employees/${user?.id}`);
      setProfile(response.data);
    };

    if (user) fetchProfile();
  }, [user]);

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="bg-white p-8 rounded shadow max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">My Profile</h2>

      <div className="grid grid-cols-2 gap-4">

        <div>
          <strong>Name:</strong> {profile.firstName} {profile.lastName}
        </div>

        <div>
          <strong>Employee ID:</strong> {profile.employeeId}
        </div>

        <div>
          <strong>Designation:</strong> {profile.designation}
        </div>

        <div>
          <strong>Office Email:</strong> {profile.officeEmail}
        </div>

        <div>
          <strong>DOB:</strong> {profile.dob}
        </div>

        <div>
          <strong>DOJ:</strong> {profile.doj}
        </div>

        <div>
          <strong>PAN:</strong> {profile.pan}
        </div>

        <div>
          <strong>Aadhaar:</strong> {profile.aadhaar}
        </div>

        <div>
          <strong>Permanent Address:</strong> {profile.permanentAddress}
        </div>

        <div>
          <strong>Current Address:</strong> {profile.currentAddress}
        </div>

        <div>
          <strong>Guardian:</strong> {profile.guardianName}
        </div>

        <div>
          <strong>Mobile:</strong> {profile.mobile}
        </div>

      </div>

      <div className="mt-6 flex gap-6">

        {profile.panFileUrl && (
          <a
            href={profile.panFileUrl}
            target="_blank"
            className="text-blue-600 underline"
          >
            View PAN
          </a>
        )}

        {profile.aadhaarFileUrl && (
          <a
            href={profile.aadhaarFileUrl}
            target="_blank"
            className="text-blue-600 underline"
          >
            View Aadhaar
          </a>
        )}

      </div>
    </div>
  );
}