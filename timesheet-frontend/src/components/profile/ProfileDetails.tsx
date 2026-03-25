import React from 'react';
import { 
  IdentificationIcon, 
  BriefcaseIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface ProfileDetailsProps {
  details: any;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ details }) => {
  const profile = details.profile || {};
  
  const InfoCard = ({ icon: Icon, title, fields }: { icon: any, title: string, fields: any[] }) => (
    <div className="detail-card mb-6">
      <div className="card-header">
        <div className="card-icon">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="card-title">{title}</h3>
      </div>
      <div className="card-grid">
        {fields.map((field, idx) => (
          <div key={idx} className="field-group">
            <label>{field.label}</label>
            <div className="field-value">{field.value}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="profile-column">
      <div className="search-bar-container">
        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search for something..." 
          className="search-input"
        />
      </div>
      
      <h2 className="section-title">Profile Details</h2>
      
      <InfoCard 
        icon={IdentificationIcon} 
        title="Basic Info" 
        fields={[
          { label: 'Full Name', value: `${details.firstName} ${details.lastName}` },
          { label: 'Employee ID', value: details.employeeId },
          { label: 'Date of Birth', value: profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A' },
          { label: 'Gender', value: profile.gender || 'N/A' }
        ]}
      />
      
      <InfoCard 
        icon={BriefcaseIcon} 
        title="Work Info" 
        fields={[
          { label: 'Designation', value: details.designation },
          { label: 'Department', value: details.department },
          { label: 'Date of Joining', value: profile.doj ? new Date(profile.doj).toLocaleDateString() : 'N/A' },
          { label: 'Reporting To', value: details.reportingManagerDetails ? `${details.reportingManagerDetails.firstName} ${details.reportingManagerDetails.lastName}` : 'N/A' }
        ]}
      />
      
      <InfoCard 
        icon={EnvelopeIcon} 
        title="Contact Info" 
        fields={[
          { label: 'Office Email', value: details.officeEmail },
          { label: 'Personal Mobile', value: profile.personalMobile || 'N/A' },
          { label: 'Personal Email', value: profile.personalEmail || 'N/A' },
          { label: 'Current Address', value: profile.currentAddress || 'N/A' }
        ]}
      />
    </div>
  );
};

export default ProfileDetails;
