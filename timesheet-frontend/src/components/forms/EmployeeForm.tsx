"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function EmployeeForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    designation: "",
    reportingManager: "",
    reportingPartner: "",
    officeEmail: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (Object.values(form).some((value) => !value)) {
      alert("All fields are mandatory");
      return;
    }

    try {
      setLoading(true);
      await api.post("/employees", form);
      alert("Employee Created Successfully");
      setForm({
        firstName: "",
        lastName: "",
        designation: "",
        reportingManager: "",
        reportingPartner: "",
        officeEmail: "",
      });
    } catch (error) {
      alert("Error creating employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded shadow max-w-3xl">
      <h2 className="text-2xl font-bold mb-6">Create New Employee</h2>

      <div className="grid grid-cols-2 gap-4">

        <input
          name="firstName"
          placeholder="First Name"
          value={form.firstName}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          name="lastName"
          placeholder="Last Name"
          value={form.lastName}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <select
          name="designation"
          value={form.designation}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">Select Designation</option>
          <option value="Executive">Executive</option>
          <option value="Manager">Manager</option>
          <option value="Senior Manager">Senior Manager</option>
          <option value="Partner">Partner</option>
          <option value="Owner">Owner</option>
        </select>

        <input
          name="reportingManager"
          placeholder="Reporting Manager ID"
          value={form.reportingManager}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          name="reportingPartner"
          placeholder="Reporting Partner ID"
          value={form.reportingPartner}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          name="officeEmail"
          type="email"
          placeholder="Office Email"
          value={form.officeEmail}
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
        />

      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded"
      >
        {loading ? "Creating..." : "Create Employee"}
      </button>
    </div>
  );
}