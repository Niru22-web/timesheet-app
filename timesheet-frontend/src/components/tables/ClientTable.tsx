"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

interface Client {
  id: string;
  clientId: string;
  name: string;
  alias: string;
  gstStatus: "registered" | "unregistered";
}

export default function ClientTable() {
  const [clients, setClients] = useState<Client[]>([]);

  const fetchClients = async () => {
    const res = await api.get("/clients");
    setClients(res.data);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Client Master</h2>
        <Link
          href="/clients/create"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Client
        </Link>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Client ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Alias</th>
            <th className="border p-2">GST Status</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td className="border p-2">{client.clientId}</td>
              <td className="border p-2">{client.name}</td>
              <td className="border p-2">{client.alias}</td>
              <td className="border p-2 capitalize">
                {client.gstStatus}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}