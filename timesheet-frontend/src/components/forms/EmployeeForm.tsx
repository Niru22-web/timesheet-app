"use client";

import { useState, useEffect } from "react";
import API from "../api";

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

  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
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
    <div className="bg-white p-4 rounded shadow max-w-5xl">
      <h2 className="text-xl font-bold mb-3">Create New Employee</h2>

      <div className="grid grid-cols-2 gap-3">

        <input
          name="firstName"
          placeholder="First Name"
          value={form.firstName}
          onChange={handleChange}
          className="border px-3 py-2 h-9 rounded text-sm"
        />

        <input
          name="lastName"
          placeholder="Last Name"
          value={form.lastName}
          onChange={handleChange}
          className="border px-3 py-2 h-9 rounded text-sm"
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="border px-3 py-2 h-9 rounded text-sm"
        >
          <option value="Employee">Employee</option>
          <option value="Manager">Manager</option>
          <option value="Partner">Partner</option>
          <option value="Admin">Admin</option>
        </select>

        <select
          name="department"
          value={form.department}
          onChange={handleChange}
          className="border px-3 py-2 h-9 rounded text-sm"
        >
          <option value="">Select Department</option>
          <option value="Accounting">Accounting</option>
          <option value="Operations">Operations</option>
          <option value="Internal Audit">Internal Audit</option>
          <option value="Automations">Automations</option>
          <option value="Statutory Audit">Statutory Audit</option>
        </select>

        <select
          name="designation"
          value={form.designation}
          onChange={handleChange}
          className="border px-3 py-2 h-9 rounded text-sm"
        >
          <option value="">Select Designation</option>
          <option value="Executive">Executive</option>
          <option value="Manager">Manager</option>
          <option value="Senior Manager">Senior Manager</option>
          <option value="Partner">Partner</option>
          <option value="Owner">Owner</option>
        </select>

        {form.role !== 'Partner' && (
          <select
            name="reportingPartner"
            value={form.reportingPartner}
            onChange={handleChange}
            className="border px-3 py-2 h-9 rounded text-sm"
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
        )}

        {form.role === 'Employee' && form.reportingPartner && (
          <select
            name="reportingManager"
            value={form.reportingManager}
            onChange={handleChange}
            className="border px-3 py-2 h-9 rounded text-sm"
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
              // Show partners as fallback managers when no managers exist under selected partner
              partners.filter(p => (p.id || p._id) === form.reportingPartner).map(partner => (
                <option key={partner.id || partner._id} value={partner.id || partner._id}>
                  {partner.firstName} {partner.lastName} (Partner)
                </option>
              ))
            ) : (
              <option disabled>Select a partner first</option>
            )}
          </select>
        )}

        {form.role === 'Employee' && !form.reportingPartner && (
          <div className="border px-3 py-2 h-9 rounded text-sm bg-gray-50 text-gray-500">
            {form.department ? 'Select partner first' : 'Select department first'}
          </div>
        )}

        <input
          name="officeEmail"
          type="email"
          placeholder="Office Email"
          value={form.officeEmail}
          onChange={handleChange}
          className="border px-3 py-2 h-9 rounded text-sm col-span-2"
        />

      </div>

      <div className="flex justify-between items-center mt-4 pt-3 border-t sticky bottom-0 bg-white">
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
          }}
          className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Employee"}
        </button>
      </div>
    </div>
  );
}