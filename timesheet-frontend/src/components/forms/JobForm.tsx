"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  clientId: string;
}

export default function JobForm() {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  const [form, setForm] = useState({
    clientId: "",
    projectId: "",
    name: "",
    status: "",
    description: "",
    startDate: "",
    endDate: "",
    billable: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const clientRes = await api.get("/clients");
      const projectRes = await api.get("/projects");
      setClients(clientRes.data);
      setProjects(projectRes.data);
    };
    fetchData();
  }, []);

  const handleClientChange = (e: any) => {
    const clientId = e.target.value;
    setForm({ ...form, clientId, projectId: "" });

    const filtered = projects.filter(
      (project) => project.clientId === clientId
    );
    setFilteredProjects(filtered);
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (
      !form.clientId ||
      !form.projectId ||
      !form.name ||
      !form.status ||
      !form.startDate ||
      !form.billable
    ) {
      alert("All mandatory fields required");
      return;
    }

    try {
      await api.post("/jobs", form);
      alert("Job Created Successfully");
      router.push("/jobs");
    } catch (error) {
      alert("Error creating job");
    }
  };

  return (
    <div className="bg-white p-8 rounded shadow max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Create Job</h2>

      <div className="grid grid-cols-2 gap-4">

        <select onChange={handleClientChange} className="border p-2 rounded">
          <option value="">Select Client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>

        <select
          name="projectId"
          onChange={handleChange}
          value={form.projectId}
          className="border p-2 rounded"
        >
          <option value="">Select Project</option>
          {filteredProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <input name="name" placeholder="Job Name" onChange={handleChange} className="border p-2 rounded" />

        <select name="status" onChange={handleChange} className="border p-2 rounded">
          <option value="">Status</option>
          <option value="Started">Started</option>
          <option value="In-Discussion">In-Discussion</option>
          <option value="Completed">Completed</option>
        </select>

        <input type="date" name="startDate" onChange={handleChange} className="border p-2 rounded" />
        <input type="date" name="endDate" onChange={handleChange} className="border p-2 rounded" />

        <select name="billable" onChange={handleChange} className="border p-2 rounded">
          <option value="">Billable?</option>
          <option value="true">Billable</option>
          <option value="false">Non-Billable</option>
        </select>

        <textarea
          name="description"
          placeholder="Job Description"
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
        />

      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded"
      >
        Create Job
      </button>
    </div>
  );
}