"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface Client { id: string; name: string; }
interface Project { id: string; name: string; clientId: string; }
interface Job { id: string; name: string; projectId: string; }

export default function TimelogForm() {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);

  const [form, setForm] = useState({
    clientId: "",
    projectId: "",
    jobId: "",
    hours: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const fetchData = async () => {
      const clientRes = await api.get("/clients");
      const projectRes = await api.get("/projects");
      const jobRes = await api.get("/jobs");

      setClients(clientRes.data);
      setProjects(projectRes.data);
      setJobs(jobRes.data);
    };
    fetchData();
  }, []);

  const handleClientChange = (e: any) => {
    const clientId = e.target.value;
    setForm({ ...form, clientId, projectId: "", jobId: "" });

    const filtered = projects.filter(p => p.clientId === clientId);
    setFilteredProjects(filtered);
    setFilteredJobs([]);
  };

  const handleProjectChange = (e: any) => {
    const projectId = e.target.value;
    setForm({ ...form, projectId, jobId: "" });

    const filtered = jobs.filter(j => j.projectId === projectId);
    setFilteredJobs(filtered);
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateHours = (value: string) => {
    const regex = /^([0-9]{1,2}):([0-5][0-9])$/;
    return regex.test(value);
  };

  const handleSubmit = async () => {
    if (
      !form.clientId ||
      !form.projectId ||
      !form.jobId ||
      !form.hours ||
      !form.description
    ) {
      alert("All fields required");
      return;
    }

    if (!validateHours(form.hours)) {
      alert("Invalid hour format. Use HH:MM");
      return;
    }

    if (new Date(form.date) > new Date()) {
      alert("Future date not allowed");
      return;
    }

    try {
      await api.post("/timelogs", form);
      alert("Timelog added successfully");
      router.push("/timelogs");
    } catch (error) {
      alert("Error adding timelog");
    }
  };

  return (
    <div className="bg-white p-8 rounded shadow max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Add Timelog</h2>

      <div className="grid grid-cols-2 gap-4">

        <select onChange={handleClientChange} className="border p-2 rounded">
          <option value="">Select Client</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select onChange={handleProjectChange} className="border p-2 rounded">
          <option value="">Select Project</option>
          {filteredProjects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select name="jobId" onChange={handleChange} className="border p-2 rounded">
          <option value="">Select Job</option>
          {filteredJobs.map(j => (
            <option key={j.id} value={j.id}>{j.name}</option>
          ))}
        </select>

        <input
          name="hours"
          placeholder="HH:MM"
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <textarea
          name="description"
          placeholder="Work Description"
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
        />

      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded"
      >
        Submit
      </button>
    </div>
  );
}