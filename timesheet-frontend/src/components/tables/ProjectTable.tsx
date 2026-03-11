"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

interface Project {
  id: string;
  projectId: string;
  name: string;
  clientName: string;
  status: string;
}

export default function ProjectTable() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const res = await api.get("/projects");
      setProjects(res.data);
    };
    fetchProjects();
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Project Master</h2>
        <Link
          href="/projects/create"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Project
        </Link>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Project ID</th>
            <th className="border p-2">Project Name</th>
            <th className="border p-2">Client</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td className="border p-2">{project.projectId}</td>
              <td className="border p-2">{project.name}</td>
              <td className="border p-2">{project.clientName}</td>
              <td className="border p-2">{project.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}