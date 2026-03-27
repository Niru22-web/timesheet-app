"use client";

import { useState, useEffect, useRef } from "react";
import API from "../api";

interface FormErrors {
  [key: string]: string;
}

export default function EmployeeForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    designation: "",
    role: "Employee",
    department: "",
    reportingManager: "",
    reportingPartner: "",
    officeEmail: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUsers();
    // Auto-focus first field
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      console.log('🔍 Fetching all employees for dropdowns...');
      const response = await API.get('/employees');
      
      let allUsers = [];
      if (response.data?.success && Array.isArray(response.data.data)) {
        allUsers = response.data.data;
      } else if (Array.isArray(response.data)) {
        allUsers = response.data;
      }

      const pts = allUsers.filter((u: any) => u.role === 'Partner');
      const mgs = allUsers.filter((u: any) => u.role === 'Manager');
      
      setPartners(pts);
      setManagers(mgs);
      console.log(`✅ Loaded ${pts.length} partners and ${mgs.length} managers`);
      
      // Debug: Log manager reportingPartner values
      console.log('📋 Manager reporting structure:', mgs.map(m => ({
        name: `${m.firstName} ${m.lastName}`,
        id: m.id || m._id,
        department: m.department,
        reportingPartner: m.reportingPartner
      })));
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      setPartners([]);
      setManagers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  // Filter partners based on selected department
  const filteredPartners = partners.filter(
    (p) => p.department === form.department
  );

  // Filter managers based on:
  // - selected department
  // - selected partner (managers who report to this partner)
  const filteredManagers = managers.filter(
    (m) => {
      const matchesDepartment = m.department === form.department;
      const matchesPartner = m.reportingPartner === form.reportingPartner;
      
      console.log(`Manager ${m.firstName} ${m.lastName}:`, {
        department: m.department,
        matchesDepartment,
        reportingPartner: m.reportingPartner,
        selectedPartner: form.reportingPartner,
        matchesPartner
      });
      
      return matchesDepartment && matchesPartner;
    }
  );

  // Debug logs to check data structure
  useEffect(() => {
    console.log("All Managers:", managers);
    console.log("Manager reportingPartner values:", managers.map(m => ({ name: `${m.firstName} ${m.lastName}`, reportingPartner: m.reportingPartner })));
    console.log("Selected Partner ID:", form.reportingPartner);
  }, [managers, form.reportingPartner]);

  // Debug logs
  useEffect(() => {
    console.log("Partners:", partners);
    console.log("Filtered Partners:", filteredPartners);
    console.log("Selected Partner:", form.reportingPartner);
    console.log("Filtered Managers:", filteredManagers);
    console.log("Selected Manager:", form.reportingManager);
  }, [form.department, form.reportingPartner, form.reportingManager, partners, managers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const newForm = { ...prev, [name]: value };
      
      // Reset dependent fields when role changes
      if (name === 'role') {
        if (value === 'Partner') {
          newForm.reportingPartner = '';
          newForm.reportingManager = '';
        } else if (value === 'Manager') {
          newForm.reportingManager = '';
        }
      }
      
      // Reset manager when partner changes
      if (name === 'reportingPartner') {
        newForm.reportingManager = '';
      }
      
      // Reset partner and manager when department changes
      if (name === 'department') {
        newForm.reportingPartner = '';
        newForm.reportingManager = '';
      }
      
      return newForm;
    });
  };

  const handleSubmit = async () => {
    const requiredFields = ['firstName', 'lastName', 'designation', 'role', 'department', 'officeEmail'];
    
    // Add conditional required fields
    if (form.role !== 'Partner') {
      requiredFields.push('reportingPartner');
    }
    if (form.role === 'Employee') {
      requiredFields.push('reportingManager');
    }

    if (requiredFields.some((field) => !form[field as keyof typeof form])) {
      alert("All fields are mandatory");
      return;
    }

    try {
      setLoading(true);
      const response = await API.post("/employees", form);
      
      if (response.data?.emailStatus === "failed") {
        if (
          response.data.message?.includes("401") || 
          response.data.message?.includes("Outlook connection expired") ||
          response.data.message?.includes("reconnect email account")
        ) {
          alert("Email connection expired. Please reconnect Outlook in Email Configuration.");
        } else {
          alert(response.data.message || "Employee created, but failed to send email.");
        }
      } else {
        alert("Employee Created Successfully");
      }

      setForm({
        firstName: "",
        lastName: "",
        designation: "",
        role: "Employee",
        department: "",
        reportingManager: "",
        reportingPartner: "",
        officeEmail: "",
      });
      setManagers([]);
    } catch (error) {
      alert("Error creating employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <style jsx>{`
        .form-container::-webkit-scrollbar {
          width: 6px;
        }
        .form-container::-webkit-scrollbar-thumb {
          background: #cbd5f5;
          border-radius: 10px;
        }
        .form-container::-webkit-scrollbar-thumb:hover {
          background: #a5b4fc;
        }
      `}</style>
      
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Fixed Header */}
        <div className="px-8 py-6 border-b border-gray-100 bg-white">
          <h1 className="text-2xl font-semibold text-gray-900">Register Employee</h1>
          <p className="text-sm text-gray-600 mt-1">Add new employee details</p>
        </div>

        {/* Scrollable Form Content */}
        <div className="form-container max-h-[70vh] overflow-y-auto px-8 py-6">
          
          {/* Personal Details Section */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Personal Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  ref={firstInputRef}
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Enter first name"
                  value={form.firstName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                    errors.firstName ? 'border-red-500' : ''
                  }`}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Enter last name"
                  value={form.lastName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                    errors.lastName ? 'border-red-500' : ''
                  }`}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Job Information Section */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Job Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role *
                </label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                    errors.role ? 'border-red-500' : ''
                  }`}
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="Partner">Partner</option>
                  <option value="Admin">Admin</option>
                </select>
                {errors.role && (
                  <p className="text-xs text-red-600 mt-1">{errors.role}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department *
                </label>
                <select
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                    errors.department ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select Department</option>
                  <option value="Accounting">Accounting</option>
                  <option value="Operations">Operations</option>
                  <option value="Internal Audit">Internal Audit</option>
                  <option value="Automations">Automations</option>
                  <option value="Statutory Audit">Statutory Audit</option>
                </select>
                {errors.department && (
                  <p className="text-xs text-red-600 mt-1">{errors.department}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="designation" className="block text-sm font-medium text-gray-700">
                  Designation *
                </label>
                <select
                  id="designation"
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                    errors.designation ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select Designation</option>
                  <option value="Executive">Executive</option>
                  <option value="Manager">Manager</option>
                  <option value="Senior Manager">Senior Manager</option>
                  <option value="Partner">Partner</option>
                  <option value="Owner">Owner</option>
                </select>
                {errors.designation && (
                  <p className="text-xs text-red-600 mt-1">{errors.designation}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Details Section */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Contact Details
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label htmlFor="officeEmail" className="block text-sm font-medium text-gray-700">
                  Office Email *
                </label>
                <input
                  id="officeEmail"
                  name="officeEmail"
                  type="email"
                  placeholder="Enter office email address"
                  value={form.officeEmail}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                    errors.officeEmail ? 'border-red-500' : ''
                  }`}
                />
                {errors.officeEmail && (
                  <p className="text-xs text-red-600 mt-1">{errors.officeEmail}</p>
                )}
              </div>
            </div>
          </div>

          {/* Salary / Role Details Section */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Reporting Structure
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {form.role !== 'Partner' && (
                <div className="space-y-1">
                  <label htmlFor="reportingPartner" className="block text-sm font-medium text-gray-700">
                    Reporting Partner *
                  </label>
                  <select
                    id="reportingPartner"
                    name="reportingPartner"
                    value={form.reportingPartner}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.reportingPartner ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select Partner...</option>
                    {usersLoading ? (
                      <option disabled>Loading partners...</option>
                    ) : filteredPartners.length > 0 ? (
                      filteredPartners.map(partner => (
                        <option key={partner.id || partner._id} value={partner.id || partner._id}>
                          {partner.firstName} {partner.lastName}
                        </option>
                      ))
                    ) : (
                      <option disabled>No partners available for this department</option>
                    )}
                  </select>
                  {errors.reportingPartner && (
                    <p className="text-xs text-red-600 mt-1">{errors.reportingPartner}</p>
                  )}
                </div>
              )}

              {form.role === 'Employee' && form.reportingPartner && (
                <div className="space-y-1">
                  <label htmlFor="reportingManager" className="block text-sm font-medium text-gray-700">
                    Reporting Manager *
                  </label>
                  <select
                    id="reportingManager"
                    name="reportingManager"
                    value={form.reportingManager}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.reportingManager ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select Manager...</option>
                    {usersLoading ? (
                      <option disabled>Loading managers...</option>
                    ) : filteredManagers.length > 0 ? (
                      filteredManagers.map(manager => (
                        <option key={manager.id || manager._id} value={manager.id || manager._id}>
                          {manager.firstName} {manager.lastName}
                        </option>
                      ))
                    ) : form.reportingPartner ? (
                      partners.filter(p => (p.id || p._id) === form.reportingPartner).map(partner => (
                        <option key={partner.id || partner._id} value={partner.id || partner._id}>
                          {partner.firstName} {partner.lastName} (Partner)
                        </option>
                      ))
                    ) : (
                      <option disabled>Select a partner first</option>
                    )}
                  </select>
                  {errors.reportingManager && (
                    <p className="text-xs text-red-600 mt-1">{errors.reportingManager}</p>
                  )}
                </div>
              )}

              {form.role === 'Employee' && !form.reportingPartner && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Reporting Manager *
                  </label>
                  <div className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500">
                    {form.department ? 'Select partner first' : 'Select department first'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-8 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                setForm({
                  firstName: "",
                  lastName: "",
                  designation: "",
                  role: "Employee",
                  department: "",
                  reportingManager: "",
                  reportingPartner: "",
                  officeEmail: "",
                });
                setManagers([]);
                setErrors({});
              }}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating..." : "Create Employee"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}