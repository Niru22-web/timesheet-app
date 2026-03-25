"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/api";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [form, setForm] = useState({
    password: "",
    dob: "",
    doj: "",
    education: "",
    maritalStatus: "",
    gender: "",
    permanentAddress: "",
    currentAddress: "",
    pinCode: "",
    guardianName: "",
    guardianAddress: "",
    guardianNumber: "",
    personalEmail: "",
    mobile: "",
    pan: "",
    aadhaar: "",
  });

  const [panFile, setPanFile] = useState<File | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "panFile") {
      setPanFile(e.target.files[0]);
    } else if (e.target.name === "aadhaarFile") {
      setAadhaarFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    try {
        const formData = new FormData();

        formData.append("token", token || "");

        Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
        });

        if (panFile) formData.append("panFile", panFile);
        if (aadhaarFile) formData.append("aadhaarFile", aadhaarFile);

        await api.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        });

        alert("Registration completed successfully");
        router.push("/login");
    } catch (error) {
        alert("Registration failed");
    }
    };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow max-w-4xl w-full">
        <h2 className="text-2xl font-bold mb-6">Complete Registration</h2>

        <div className="grid grid-cols-2 gap-4">

          <input name="password" type="password" placeholder="Password" onChange={handleChange} className="border p-2 rounded" />
          <input name="dob" type="date" onChange={handleChange} className="border p-2 rounded" />
          <input name="doj" type="date" onChange={handleChange} className="border p-2 rounded" />

          <select name="education" onChange={handleChange} className="border p-2 rounded">
            <option value="">Education</option>
            <option value="BCom">BCom</option>
            <option value="MCom">MCom</option>
            <option value="CA">CA</option>
            <option value="MBA">MBA</option>
          </select>

          <select name="maritalStatus" onChange={handleChange} className="border p-2 rounded">
            <option value="">Marital Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
          </select>

          <select name="gender" onChange={handleChange} className="border p-2 rounded">
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <input name="permanentAddress" placeholder="Permanent Address" onChange={handleChange} className="border p-2 rounded col-span-2" />
          <input name="currentAddress" placeholder="Current Address" onChange={handleChange} className="border p-2 rounded col-span-2" />

          <input name="pinCode" placeholder="PIN Code" onChange={handleChange} className="border p-2 rounded" />
          <input name="guardianName" placeholder="Guardian Name" onChange={handleChange} className="border p-2 rounded" />
          <input name="guardianAddress" placeholder="Guardian Address" onChange={handleChange} className="border p-2 rounded col-span-2" />
          <input name="guardianNumber" placeholder="Guardian Number" onChange={handleChange} className="border p-2 rounded" />

          <input name="personalEmail" placeholder="Personal Email" onChange={handleChange} className="border p-2 rounded" />
          <input name="mobile" placeholder="Mobile Number" onChange={handleChange} className="border p-2 rounded" />
          <input name="pan" placeholder="PAN" onChange={handleChange} className="border p-2 rounded" />
          <input name="aadhaar" placeholder="Aadhaar" onChange={handleChange} className="border p-2 rounded" />

        </div>

        <button
          onClick={handleSubmit}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded"
        >
          Complete Registration
        </button>
      </div>
    </div>
  );
}