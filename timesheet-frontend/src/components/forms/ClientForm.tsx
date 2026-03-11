"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

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
    pan: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (Object.values(form).some((v) => !v && v !== "gstin")) {
      alert("All fields mandatory");
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

  return (
    <div className="bg-white p-8 rounded shadow max-w-3xl">
      <h2 className="text-2xl font-bold mb-6">Create Client</h2>

      <div className="grid grid-cols-2 gap-4">

        <input name="name" placeholder="Client Name" onChange={handleChange} className="border p-2 rounded" />
        <input name="alias" placeholder="Alias" onChange={handleChange} className="border p-2 rounded" />

        <input name="address" placeholder="Address" onChange={handleChange} className="border p-2 rounded col-span-2" />

        <input name="pin" placeholder="PIN Code" onChange={handleChange} className="border p-2 rounded" />
        <input name="state" placeholder="State" onChange={handleChange} className="border p-2 rounded" />

        <input name="country" placeholder="Country" onChange={handleChange} className="border p-2 rounded" />

        <select name="gstStatus" onChange={handleChange} className="border p-2 rounded">
          <option value="">GST Status</option>
          <option value="registered">Registered</option>
          <option value="unregistered">Unregistered</option>
        </select>

        {form.gstStatus === "registered" && (
          <input
            name="gstin"
            placeholder="GSTIN"
            onChange={handleChange}
            className="border p-2 rounded"
          />
        )}

        <input name="pan" placeholder="PAN" onChange={handleChange} className="border p-2 rounded" />

      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded"
      >
        Create Client
      </button>
    </div>
  );
}