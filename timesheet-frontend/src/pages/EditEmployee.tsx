import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  UserIcon,
  DocumentTextIcon,
  BanknotesIcon,
  PhotoIcon,
  IdentificationIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StatusBadge from '../components/ui/StatusBadge';
import Avatar from '../components/ui/Avatar';
import API from '../api';

interface EmployeeDetails {
  // Personal Details
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  officeEmail: string;
  personalEmail?: string;
  phone?: string;
  address?: string;
  dob?: string;
  gender?: string;
  
  // Identity Details
  panNumber?: string;
  aadhaarNumber?: string;
  
  // Guardian Details
  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  
  // Education Details
  qualification?: string;
  university?: string;
  passingYear?: string;
  
  // Bank Details
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  
  // Employment Details
  role: string;
  designation: string;
  department: string;
  reportingPartner?: string;
  reportingManager?: string;
  status: string;
  joiningDate?: string;
  
  // Attachments
  profile?: {
    panFileUrl?: string;
    aadhaarFileUrl?: string;
    employeePhotoUrl?: string;
    bankStatementFileUrl?: string;
  };
  
  // Reporting details
  reportingPartnerDetails?: {
    id: string;
    firstName: string;
    lastName: string;
    officeEmail: string;
    role: string;
  };
  reportingManagerDetails?: {
    id: string;
    firstName: string;
    lastName: string;
    officeEmail: string;
    role: string;
  };
}

const EditEmployee: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [employee, setEmployee] = useState<EmployeeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/employees/${id}`);
      
      if (response.data.success) {
        setEmployee(response.data.data);
      } else {
        setError('Failed to fetch employee details');
      }
    } catch (err: any) {
      setError('Error fetching employee details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!employee) return;
    
    try {
      setSaving(true);
      
      // Only allow editing of certain fields
      const updateData = {
        firstName: employee.firstName,
        lastName: employee.lastName,
        officeEmail: employee.officeEmail,
        personalEmail: employee.personalEmail,
        phone: employee.phone,
        address: employee.address,
        gender: employee.gender,
        guardianName: employee.guardianName,
        guardianPhone: employee.guardianPhone,
        guardianRelation: employee.guardianRelation,
        qualification: employee.qualification,
        university: employee.university,
        passingYear: employee.passingYear,
        bankName: employee.bankName,
        accountNumber: employee.accountNumber,
        ifscCode: employee.ifscCode,
        branchName: employee.branchName,
        // Note: role, reportingPartner, reportingManager are NOT editable
      };
      
      const response = await API.put(`/employees/${id}`, updateData);
      
      if (response.data) {
        alert('Employee updated successfully!');
        navigate('/employees');
      } else {
        setError('Failed to update employee');
      }
    } catch (err: any) {
      setError('Error updating employee: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadAttachment = (url: string, filename: string) => {
    if (url) {
      const link = document.createElement('a');
      link.href = `http://localhost:3001${url}`;
      link.download = filename;
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <div className="text-center p-8">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
            <Button 
              onClick={() => navigate('/employees')}
              className="mt-6"
            >
              Back to Employees
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/employees')}
            variant="secondary"
            className="mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Employees
          </Button>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Employee</h1>
            <p className="text-gray-600">
              Editing: {employee.firstName} {employee.lastName} ({employee.employeeId})
            </p>
            <StatusBadge status={employee.status} className="inline-block" />
          </div>
        </div>

        {/* Personal Information */}
        <Card className="mb-8">
          <div className="flex items-center mb-4">
            <UserIcon className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Input
                label="First Name"
                value={employee.firstName}
                onChange={(e) => setEmployee({...employee, firstName: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Input
                label="Last Name"
                value={employee.lastName}
                onChange={(e) => setEmployee({...employee, lastName: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Input
                label="Office Email"
                type="email"
                value={employee.officeEmail || ''}
                onChange={(e) => setEmployee({...employee, officeEmail: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Input
                label="Personal Email"
                type="email"
                value={employee.personalEmail || ''}
                onChange={(e) => setEmployee({...employee, personalEmail: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="Phone"
                value={employee.phone || ''}
                onChange={(e) => setEmployee({...employee, phone: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="Address"
                value={employee.address || ''}
                onChange={(e) => setEmployee({...employee, address: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="Date of Birth"
                type="date"
                value={employee.dob ? employee.dob.split('T')[0] : ''}
                onChange={(e) => setEmployee({...employee, dob: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="Gender"
                value={employee.gender || ''}
                onChange={(e) => setEmployee({...employee, gender: e.target.value})}
              />
            </div>
          </div>
        </Card>

        {/* Identity Documents */}
        <Card className="mb-8">
          <div className="flex items-center mb-4">
            <IdentificationIcon className="w-5 h-5 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Identity Documents</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="PAN Number"
                value={employee.panNumber || ''}
                onChange={(e) => setEmployee({...employee, panNumber: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="Aadhaar Number"
                value={employee.aadhaarNumber || ''}
                onChange={(e) => setEmployee({...employee, aadhaarNumber: e.target.value})}
              />
            </div>
          </div>
          
          {/* Attachments */}
          <div className="mt-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">Document Attachments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employee.profile?.panFileUrl && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">PAN Card</span>
                    <Button
                      onClick={() => handleDownloadAttachment(employee.profile.panFileUrl, 'pan-card.pdf')}
                      variant="secondary"
                      size="sm"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              )}
              
              {employee.profile?.aadhaarFileUrl && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Aadhaar Card</span>
                    <Button
                      onClick={() => handleDownloadAttachment(employee.profile.aadhaarFileUrl, 'aadhaar-card.pdf')}
                      variant="secondary"
                      size="sm"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              )}
              
              {employee.profile?.employeePhotoUrl && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Employee Photo</span>
                    <Button
                      onClick={() => handleDownloadAttachment(employee.profile.employeePhotoUrl, 'employee-photo.jpg')}
                      variant="secondary"
                      size="sm"
                    >
                      Download
                    </Button>
                  </div>
                  <img 
                    src={`http://localhost:3001${employee.profile.employeePhotoUrl}`}
                    alt="Employee Photo" 
                    className="mt-2 w-20 h-20 rounded object-cover"
                  />
                </div>
              )}
              
              {employee.profile?.bankStatementFileUrl && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Bank Statement</span>
                    <Button
                      onClick={() => handleDownloadAttachment(employee.profile.bankStatementFileUrl, 'bank-statement.pdf')}
                      variant="secondary"
                      size="sm"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Guardian Details */}
        <Card className="mb-8">
          <div className="flex items-center mb-4">
            <UserGroupIcon className="w-5 h-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Guardian Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Input
                label="Guardian Name"
                value={employee.guardianName || ''}
                onChange={(e) => setEmployee({...employee, guardianName: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="Guardian Phone"
                value={employee.guardianPhone || ''}
                onChange={(e) => setEmployee({...employee, guardianPhone: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="Guardian Relation"
                value={employee.guardianRelation || ''}
                onChange={(e) => setEmployee({...employee, guardianRelation: e.target.value})}
              />
            </div>
          </div>
        </Card>

        {/* Education Details */}
        <Card className="mb-8">
          <div className="flex items-center mb-4">
            <AcademicCapIcon className="w-5 h-5 text-indigo-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Education Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Input
                label="Qualification"
                value={employee.qualification || ''}
                onChange={(e) => setEmployee({...employee, qualification: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="University"
                value={employee.university || ''}
                onChange={(e) => setEmployee({...employee, university: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="Passing Year"
                value={employee.passingYear || ''}
                onChange={(e) => setEmployee({...employee, passingYear: e.target.value})}
              />
            </div>
          </div>
        </Card>

        {/* Bank Details */}
        <Card className="mb-8">
          <div className="flex items-center mb-4">
            <BanknotesIcon className="w-5 h-5 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Bank Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Input
                label="Bank Name"
                value={employee.bankName || ''}
                onChange={(e) => setEmployee({...employee, bankName: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="Account Number"
                value={employee.accountNumber || ''}
                onChange={(e) => setEmployee({...employee, accountNumber: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="IFSC Code"
                value={employee.ifscCode || ''}
                onChange={(e) => setEmployee({...employee, ifscCode: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="Branch Name"
                value={employee.branchName || ''}
                onChange={(e) => setEmployee({...employee, branchName: e.target.value})}
              />
            </div>
          </div>
        </Card>

        {/* Employment Details (Read-only) */}
        <Card className="mb-8">
          <div className="flex items-center mb-4">
            <BuildingOfficeIcon className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Employment Details</h2>
            <span className="ml-4 text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded">Read-only</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Input
                label="Software Role"
                value={employee.role}
                disabled
                className="bg-gray-100"
              />
            </div>
            
            <div>
              <Input
                label="Designation"
                value={employee.designation}
                disabled
                className="bg-gray-100"
              />
            </div>
            
            <div>
              <Input
                label="Department"
                value={employee.department}
                disabled
                className="bg-gray-100"
              />
            </div>
            
            <div>
              <Input
                label="Reporting Partner"
                value={employee.reportingPartnerDetails ? 
                  `${employee.reportingPartnerDetails.firstName} ${employee.reportingPartnerDetails.lastName}` : 'None'}
                disabled
                className="bg-gray-100"
              />
            </div>
            
            <div>
              <Input
                label="Reporting Manager"
                value={employee.reportingManagerDetails ? 
                  `${employee.reportingManagerDetails.firstName} ${employee.reportingManagerDetails.lastName}` : 'None'}
                disabled
                className="bg-gray-100"
              />
            </div>
            
            <div>
              <Input
                label="Status"
                value={employee.status}
                disabled
                className="bg-gray-100"
              />
            </div>
            
            <div>
              <Input
                label="Joining Date"
                value={employee.joiningDate ? employee.joiningDate.split('T')[0] : ''}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mb-8">
          <Button
            onClick={() => navigate('/employees')}
            variant="secondary"
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={saving}
            className="min-w-32"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
            <div className="flex">
              <span className="text-sm font-medium">{error}</span>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditEmployee;
