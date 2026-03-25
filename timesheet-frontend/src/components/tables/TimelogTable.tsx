"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Timelog {
  id: string;
  date: string;
  hours: string;
  description: string;
  jobName: string;
}

export default function TimelogTable() {
  const [logs, setLogs] = useState<Timelog[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchLogs = async () => {
    const res = await api.get("/timelogs", {
      params: { fromDate, toDate },
    });
    setLogs(res.data);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">My Timelogs</h2>

      <div className="flex gap-4 mb-4">
        <input type="date" onChange={(e) => setFromDate(e.target.value)} className="border p-2 rounded" />
        <input type="date" onChange={(e) => setToDate(e.target.value)} className="border p-2 rounded" />
        <button onClick={fetchLogs} className="bg-blue-600 text-white px-4 py-2 rounded">
          Filter
        </button>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Date</th>
            <th className="border p-2">Job</th>
            <th className="border p-2">Hours</th>
            <th className="border p-2">Description</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="border p-2">{log.date}</td>
              <td className="border p-2">{log.jobName}</td>
              <td className="border p-2">{log.hours}</td>
              <td className="border p-2">{log.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}