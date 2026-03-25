"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import SummaryCards from "./SummaryCards";
import EmployeeSummaryTable from "./EmployeeSummaryTable";

export default function ReportsDashboard() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState<any>(null);

  const fetchReports = async () => {
    const res = await api.get("/reports/summary", {
      params: { fromDate, toDate },
    });
    setData(res.data);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="space-y-6">

      <h2 className="text-2xl font-bold">Reports Dashboard</h2>

      <div className="flex gap-4">
        <input type="date" onChange={(e) => setFromDate(e.target.value)} className="border p-2 rounded" />
        <input type="date" onChange={(e) => setToDate(e.target.value)} className="border p-2 rounded" />
        <button onClick={fetchReports} className="bg-blue-600 text-white px-4 py-2 rounded">
          Apply Filter
        </button>
      </div>

      {data && (
        <>
          <SummaryCards data={data} />
          <EmployeeSummaryTable employees={data.employeeSummary} />
        </>
      )}
    </div>
  );
}