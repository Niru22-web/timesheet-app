export default function SummaryCards({ data }: any) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <p>Total Hours</p>
        <h3 className="text-xl font-bold">{data.totalHours}</h3>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <p>Billable Hours</p>
        <h3 className="text-xl font-bold">{data.billableHours}</h3>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <p>Non-Billable Hours</p>
        <h3 className="text-xl font-bold">{data.nonBillableHours}</h3>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <p>Utilization %</p>
        <h3 className="text-xl font-bold">{data.utilization}%</h3>
      </div>
    </div>
  );
}