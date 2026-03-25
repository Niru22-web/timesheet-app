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
  const [loading, setLoading] = useState(true);

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
      try {
        setLoading(true);
        console.log("Fetching clients and projects...");
        const clientRes = await api.get("/clients");
        const projectRes = await api.get("/projects");
        
        console.log("Clients response:", clientRes.data);
        console.log("Projects response:", projectRes.data);

        // Backend returns { success: true, data: [...], message: "..." }
        if (clientRes.data && clientRes.data.success) {
          setClients(clientRes.data.data || []);
        } else {
          console.error("Failed to fetch clients:", clientRes.data?.message);
        }

        if (projectRes.data && projectRes.data.success) {
          setProjects(projectRes.data.data || []);
        } else {
          console.error("Failed to fetch projects:", projectRes.data?.message);
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        console.error("Network / Server error details:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
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
    <div className="bg-white p-4 rounded shadow max-w-5xl">
      <h2 className="text-xl font-bold mb-3">Create Job</h2>

      <div className="grid grid-cols-2 gap-3">

        <select 
          name="clientId" 
          value={form.clientId}
          onChange={handleClientChange} 
          className="border px-3 py-2 h-9 rounded text-sm bg-white"
        >
          <option value="">{loading ? "Loading clients..." : "Select Client"}</option>
          {clients.length > 0 ? (
            clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))
          ) : !loading && (
            <option disabled>No clients found</option>
          )}
        </select>

        <select
          name="projectId"
          onChange={handleChange}
          value={form.projectId}
          className="border px-3 py-2 h-9 rounded text-sm"
        >
          <option value="">Select Project</option>
          {filteredProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <input name="name" placeholder="Job Name" onChange={handleChange} className="border px-3 py-2 h-9 rounded text-sm" />

        <select name="status" onChange={handleChange} className="border px-3 py-2 h-9 rounded text-sm">
          <option value="">Status</option>
          <option value="Started">Started</option>
          <option value="In-Discussion">In-Discussion</option>
          <option value="Completed">Completed</option>
        </select>

        <input type="date" name="startDate" onChange={handleChange} className="border px-3 py-2 h-9 rounded text-sm" />
        <input type="date" name="endDate" onChange={handleChange} className="border px-3 py-2 h-9 rounded text-sm" />

        <select name="billable" onChange={handleChange} className="border px-3 py-2 h-9 rounded text-sm">
          <option value="">Billable?</option>
          <option value="true">Billable</option>
          <option value="false">Non-Billable</option>
        </select>

        <textarea
          name="description"
          placeholder="Job Description"
          onChange={handleChange}
          className="border px-3 py-2 h-20 rounded text-sm col-span-2 resize-none"
        />

      </div>

      <div className="flex justify-between items-center mt-4 pt-3 border-t sticky bottom-0 bg-white">
        <button
          onClick={() => router.push("/jobs")}
          className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700"
        >
          Create Job
        </button>
      </div>
    </div>
  );
}