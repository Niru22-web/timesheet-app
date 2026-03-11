"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  designation: string;
  officeEmail: string;
  status: "pending" | "active";
}

export default function EmployeeTable() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/employees");
      setEmployees(response.data);
    } catch (error) {
      alert("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Employees</h2>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Employee ID</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Designation</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td className="p-2 border">{emp.employeeId}</td>
              <td className="p-2 border">
                {emp.firstName} {emp.lastName}
              </td>
              <td className="p-2 border">{emp.designation}</td>
              <td className="p-2 border">{emp.officeEmail}</td>
              <td className="p-2 border">
                <span
                  className={`px-2 py-1 rounded text-white text-sm ${
                    emp.status === "active"
                      ? "bg-green-500"
                      : "bg-yellow-500"
                  }`}
                >
                  {emp.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}