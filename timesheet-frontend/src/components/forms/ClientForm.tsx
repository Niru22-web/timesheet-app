"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Puducherry", "Chandigarh"
];

const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Japan", "China", "Singapore", "UAE", "Saudi Arabia", "Others"
];

export default function ClientForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    alias: "",
    address: "",
    pin: "",
    state: "",
    country: "",
    gstStatus: "",
    gstin: "",
    pan: ""
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Reset state when country changes
    if (name === "country") {
      setForm(prev => ({ ...prev, state: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!form.name) {
      alert("Client Name is mandatory");
      return;
    }

    if (!form.country) {
      alert("Country is mandatory");
      return;
    }

    if (form.country === "India" && !form.state) {
      alert("State is mandatory when Country is India");
      return;
    }

    if (form.gstStatus === "registered" && !form.gstin) {
      alert("GSTIN is mandatory if GST Registered");
      return;
    }

    try {
      await api.post("/clients", form);
      alert("Client Created Successfully");
      router.push("/clients");
    } catch (error) {
      alert("Error creating client");
    }
  };

  const getAvailableStates = () => {
    if (form.country === "India") {
      return INDIAN_STATES;
    }
    return [];
  };

  return (
    <div className="bg-white p-4 rounded shadow max-w-5xl">
      <h2 className="text-xl font-bold mb-3">Create Client</h2>

      <div className="grid grid-cols-2 gap-3">
        <input name="name" placeholder="Legal Client Name *" onChange={handleChange} className="border px-3 py-2 h-9 rounded text-sm" required />
        <input name="alias" placeholder="Alias / Short Code" onChange={handleChange} className="border px-3 py-2 h-9 rounded text-sm" />

        <input name="address" placeholder="Registered Address" onChange={handleChange} className="border px-3 py-2 h-9 rounded text-sm col-span-2" />

        <select 
          name="country" 
          onChange={handleChange} 
          value={form.country}
          className="border px-3 py-2 h-9 rounded text-sm"
          required
        >
          <option value="">Select Country</option>
          {COUNTRIES.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
        
        <select 
          name="state" 
          onChange={handleChange} 
          value={form.state}
          className="border px-3 py-2 h-9 rounded text-sm"
          disabled={!form.country || form.country !== "India"}
        >
          <option value="">Select Country First</option>
          {getAvailableStates().map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>

        <input name="pin" placeholder="PIN Code" onChange={handleChange} className="border px-3 py-2 h-9 rounded text-sm" />

        <select name="gstStatus" onChange={handleChange} className="border px-3 py-2 h-9 rounded text-sm">
          <option value="">GST Status</option>
          <option value="registered">Registered</option>
          <option value="unregistered">Unregistered</option>
        </select>

        {form.gstStatus === "registered" && (
          <input
            name="gstin"
            placeholder="GSTIN"
            onChange={handleChange}
            className="border px-3 py-2 h-9 rounded text-sm"
          />
        )}
        <input name="pan" placeholder="PAN" onChange={handleChange} className="border px-3 py-2 h-9 rounded text-sm" />


      </div>

      <div className="flex justify-between items-center mt-4 pt-3 border-t sticky bottom-0 bg-white">
        <button
          onClick={() => router.push("/clients")}
          className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700"
        >
          Create Client
        </button>
      </div>
    </div>
  );
}