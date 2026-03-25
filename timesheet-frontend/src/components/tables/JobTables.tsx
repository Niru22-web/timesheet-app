"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

interface Job {
  id: string;
  jobId: string;
  name: string;
  projectName: string;
  status: string;
}

export default function JobTable() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const res = await api.get("/jobs");
      setJobs(res.data);
    };
    fetchJobs();
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Job Master</h2>
        <Link
          href="/jobs/create"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Job
        </Link>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Job ID</th>
            <th className="border p-2">Job Name</th>
            <th className="border p-2">Project</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td className="border p-2">{job.jobId}</td>
              <td className="border p-2">{job.name}</td>
              <td className="border p-2">{job.projectName}</td>
              <td className="border p-2">{job.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}