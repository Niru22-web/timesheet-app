import React from 'react';
import { 
  UserIcon, 
  EnvelopeIcon, 
  IdentificationIcon, 
  BriefcaseIcon,
  AcademicCapIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import ProfileCard from './ProfileCard';

interface ProfileDetailsProps {
  details: any;
  loading?: boolean;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ details, loading }) => {
  if (loading || !details) return (
    <div className="space-y-6 flex-1">
      <div className="h-64 bg-secondary-50 animate-pulse rounded-2xl" />
      <div className="h-64 bg-secondary-50 animate-pulse rounded-2xl" />
    </div>
  );

  const profile = details.profile || {};

  const DetailItem = ({ label, value, icon: Icon }: any) => (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary-50 transition-colors group">
      <div className="p-2 bg-white rounded-lg border border-secondary-100 shadow-soft group-hover:border-primary-100 group-hover:text-primary-600 transition-all text-secondary-400">
        <Icon className="w-4 h-4" />
      </div>
      <div className="overflow-hidden">
        <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest leading-none">{label}</p>
        <p className="text-sm font-bold text-secondary-900 mt-1.5 truncate">{value || 'Not Configured'}</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 space-y-6 animate-fade-in custom-scrollbar overflow-y-auto px-1 pb-10">
      {/* Personal Information */}
      <ProfileCard title="Personal Credentials" icon={<UserIcon className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DetailItem label="Full Name" value={`${details.firstName} ${details.lastName}`} icon={UserIcon} />
          <DetailItem label="Personal Mobile" value={profile.personalMobile} icon={IdentificationIcon} />
          <DetailItem label="Personal Email" value={profile.personalEmail} icon={EnvelopeIcon} />
          <DetailItem label="Gender" value={profile.gender} icon={UserIcon} />
          <DetailItem label="Date of Birth" value={profile.dob ? new Date(profile.dob).toLocaleDateString() : ''} icon={EnvelopeIcon} />
          <DetailItem label="Marital Status" value={profile.maritalStatus} icon={UserIcon} />
        </div>
      </ProfileCard>

      {/* Employment & Identification */}
      <ProfileCard title="Enterprise & Governance" icon={<BuildingOfficeIcon className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DetailItem label="Employee ID" value={details.employeeId} icon={IdentificationIcon} />
          <DetailItem label="Designation" value={details.designation} icon={BriefcaseIcon} />
          <DetailItem label="Role & Hierarchy" value={details.role} icon={ShieldCheckIcon} />
          <DetailItem label="Office Email" value={details.officeEmail} icon={EnvelopeIcon} />
          <DetailItem label="PAN Card" value={profile.pan} icon={CreditCardIcon} />
          <DetailItem label="Aadhaar ID" value={profile.aadhaar} icon={IdentificationIcon} />
        </div>
      </ProfileCard>

      {/* Financials & Experience */}
      <ProfileCard title="Strategic Profile" icon={<BriefcaseIcon className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DetailItem label="Annual Salary (LPA)" value={profile.salary?.toLocaleString()} icon={CreditCardIcon} />
          <DetailItem label="Seniority Level" value={profile.seniorityLevel} icon={ShieldCheckIcon} />
          <DetailItem label="Total Experience" value={profile.experience} icon={BriefcaseIcon} />
          <DetailItem label="Education" value={profile.education} icon={AcademicCapIcon} />
          <DetailItem label="Employment Type" value={profile.employmentType} icon={BriefcaseIcon} />
        </div>
      </ProfileCard>

      {/* Geographical Footprint */}
      <ProfileCard title="Geographical Footprint" icon={<MapPinIcon className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest pl-1">Current Residence</p>
            <div className="p-4 bg-secondary-50/50 rounded-2xl border border-secondary-100 italic text-sm text-secondary-600 leading-relaxed min-h-[80px]">
              {profile.currentAddress || 'Physical address not detected in registry.'}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest pl-1">Permanent Domicile</p>
            <div className="p-4 bg-secondary-50/50 rounded-2xl border border-secondary-100 italic text-sm text-secondary-600 leading-relaxed min-h-[80px]">
              {profile.permanentAddress || 'Permanent address records are currently empty.'}
            </div>
          </div>
        </div>
      </ProfileCard>
    </div>
  );
};

export default ProfileDetails;
