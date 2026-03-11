"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

export default function ProjectForm() {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [form, setForm] = useState({
    clientId: "",
    name: "",
    status: "",
    startDate: "",
    billable: "",
    contactPerson: "",
    assignedUsers: [] as string[],
  });

  useEffect(() => {
    const fetchData = async () => {
      const clientRes = await api.get("/clients");
      const empRes = await api.get("/employees");
      setClients(clientRes.data);
      setEmployees(empRes.data);
    };
    fetchData();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUserSelect = (e: any) => {
    const options = Array.from(e.target.selectedOptions);
    const values = options.map((option: any) => option.value);
    setForm({ ...form, assignedUsers: values });
  };

  const handleSubmit = async () => {
    if (
      !form.clientId ||
      !form.name ||
      !form.status ||
      !form.startDate ||
      !form.billable ||
      form.assignedUsers.length === 0
    ) {
      alert("All fields mandatory");
      return;
    }

    try {
      await api.post("/projects", form);
      alert("Project Created Successfully");
      router.push("/projects");
    } catch (error) {
      alert("Error creating project");
    }
  };

  return (
    <div className="bg-white p-8 rounded shadow max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Create Project</h2>

      <div className="grid grid-cols-2 gap-4">

        <select name="clientId" onChange={handleChange} className="border p-2 rounded">
          <option value="">Select Client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>

        <input name="name" placeholder="Project Name" onChange={handleChange} className="border p-2 rounded" />

        <select name="status" onChange={handleChange} className="border p-2 rounded">
          <option value="">Status</option>
          <option value="Started">Started</option>
          <option value="In-Discussion">In-Discussion</option>
          <option value="Completed">Completed</option>
        </select>

        <input type="date" name="startDate" onChange={handleChange} className="border p-2 rounded" />

        <select name="billable" onChange={handleChange} className="border p-2 rounded">
          <option value="">Billable?</option>
          <option value="true">Billable</option>
          <option value="false">Non-Billable</option>
        </select>

        <input name="contactPerson" placeholder="Client Contact Person" onChange={handleChange} className="border p-2 rounded" />

        <select
          multiple
          onChange={handleUserSelect}
          className="border p-2 rounded col-span-2 h-32"
        >
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.firstName} {emp.lastName}
            </option>
          ))}
        </select>

      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded"
      >
        Create Project
      </button>
    </div>
  );
}