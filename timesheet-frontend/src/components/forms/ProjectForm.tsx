import { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";

interface Client {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

export default function ProjectForm() {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    clientId: "",
    name: "",
    status: "",
    startDate: "",
    billable: "",
    contactPerson: "",
    assignedUsers: [] as string[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching clients and employees...");
        const clientRes = await api.get("/clients");
        const empRes = await api.get("/employees");
        
        console.log("Clients response:", clientRes.data);
        console.log("Employees response:", empRes.data);

        // Backend returns { success: true, data: [...], message: "..." }
        if (clientRes.data && clientRes.data.success) {
          setClients(clientRes.data.data || []);
        } else {
          console.error("Failed to fetch clients:", clientRes.data?.message);
        }

        if (empRes.data && empRes.data.success) {
          setEmployees(empRes.data.data || []);
        } else {
          console.error("Failed to fetch employees:", empRes.data?.message);
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

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUserSelect = (e: any) => {
    const options = Array.from(e.target.selectedOptions);
    const values = options.map((option: any) => option.value);
    setForm({ ...form, assignedUsers: values });
  };

  const handleSubmit = async () => {
    if (
      !form.clientId ||
      !form.name ||
      !form.status ||
      !form.startDate ||
      !form.billable ||
      form.assignedUsers.length === 0
    ) {
      alert("All fields mandatory");
      return;
    }

    try {
      await api.post("/projects", form);
      alert("Project Created Successfully");
      navigate("/projects");
    } catch (error) {
      alert("Error creating project");
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow max-w-5xl">
      <h2 className="text-xl font-bold mb-3">Create Project</h2>

      <div className="grid grid-cols-2 gap-3">

        <select 
          name="clientId" 
          aria-label="Select Client"
          value={form.clientId}
          onChange={handleChange} 
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

        <input name="name" placeholder="Project Name" onChange={handleChange} className="border px-3 py-2 h-9 rounded text-sm" />

        <select 
          name="status" 
          aria-label="Select Status"
          onChange={handleChange} 
          className="border px-3 py-2 h-9 rounded text-sm"
        >
          <option value="">Status</option>
          <option value="Started">Started</option>
          <option value="In-Discussion">In-Discussion</option>
          <option value="Completed">Completed</option>
        </select>

        <input type="date" name="startDate" aria-label="Start Date" placeholder="Start Date" onChange={handleChange} className="border px-3 py-2 h-9 rounded text-sm" />

        <select 
          name="billable" 
          aria-label="Select Billable Status"
          onChange={handleChange} 
          className="border px-3 py-2 h-9 rounded text-sm"
        >
          <option value="">Billable?</option>
          <option value="true">Billable</option>
          <option value="false">Non-Billable</option>
        </select>

        <input name="contactPerson" placeholder="Client Contact Person" onChange={handleChange} className="border px-3 py-2 h-9 rounded text-sm" />

        <select
          multiple
          aria-label="Assign Users"
          onChange={handleUserSelect}
          className="border px-3 py-2 h-24 rounded text-sm col-span-2 resize-none"
        >
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.firstName} {emp.lastName}
            </option>
          ))}
        </select>

      </div>

      <div className="flex justify-between items-center mt-4 pt-3 border-t sticky bottom-0 bg-white">
        <button
          onClick={() => navigate("/projects")}
          className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700"
        >
          Create Project
        </button>
      </div>
    </div>
  );
}