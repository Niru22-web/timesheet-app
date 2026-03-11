interface EmployeeSummary {
  employeeName: string;
  totalHours: number;
  billableHours: number;
}

export default function EmployeeSummaryTable({ employees }: { employees: EmployeeSummary[] }) {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="text-xl font-bold mb-4">Employee Summary</h3>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Employee</th>
            <th className="border p-2">Total Hours</th>
            <th className="border p-2">Billable Hours</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, index) => (
            <tr key={index}>
              <td className="border p-2">{emp.employeeName}</td>
              <td className="border p-2">{emp.totalHours}</td>
              <td className="border p-2">{emp.billableHours}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}