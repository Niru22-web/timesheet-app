"use client";

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  if (!user) return null;

  const menuItems: Record<string, { name: string; path?: string; subItems?: { name: string; path: string }[] }[]> = {
    admin: [
      { 
        name: "Dashboard", 
        path: "/" 
      },
      { 
        name: "Timesheet", 
        path: "/timesheet",
        subItems: [
          { name: "My Timesheet", path: "/timesheet" },
          { name: "Team Timesheet", path: "/timesheet" },
          { name: "History", path: "/timesheet" },
        ]
      },
      { 
        name: "Employees", 
        path: "/employees",
        subItems: [
          { name: "All Employees", path: "/employees" },
          { name: "Add Employee", path: "/employees" },
          { name: "Employee Registration", path: "/employees" },
          { name: "Employee Reports", path: "/employees" },
        ]
      },
      { 
        name: "Projects", 
        path: "/projects",
        subItems: [
          { name: "All Projects", path: "/projects" },
          { name: "Add Project", path: "/projects" },
          { name: "Project Reports", path: "/projects" },
        ]
      },
      { 
        name: "Clients", 
        path: "/clients",
        subItems: [
          { name: "All Clients", path: "/clients" },
          { name: "Add Client", path: "/clients" },
          { name: "Client Reports", path: "/clients" },
        ]
      },
      { 
        name: "Jobs", 
        path: "/jobs",
        subItems: [
          { name: "All Jobs", path: "/jobs" },
          { name: "Add Job", path: "/jobs" },
          { name: "Job Reports", path: "/jobs" },
        ]
      },
      { 
        name: "Reports", 
        path: "/reports",
        subItems: [
          { name: "Time Reports", path: "/reports" },
          { name: "Employee Reports", path: "/reports" },
          { name: "Project Reports", path: "/reports" },
          { name: "Client Reports", path: "/reports" },
          { name: "Financial Reports", path: "/reports" },
        ]
      },
      { 
        name: "Reimbursement", 
        path: "/reimbursement",
        subItems: [
          { name: "All Reimbursements", path: "/reimbursement" },
          { name: "Add Reimbursement", path: "/reimbursement" },
          { name: "Reimbursement Reports", path: "/reimbursement" },
        ]
      },
      { 
        name: "Leave Management", 
        path: "/leave-management",
        subItems: [
          { name: "My Leaves", path: "/leave-management" },
          { name: "Team Leaves", path: "/leave-management" },
          { name: "Leave Reports", path: "/leave-management" },
        ]
      },
      { 
        name: "User Management", 
        path: "/users",
        subItems: [
          { name: "All Users", path: "/users" },
          { name: "User Registration", path: "/users" },
          { name: "User Reports", path: "/users" },
        ]
      },
      { 
        name: "Admin", 
        path: "/admin",
        subItems: [
          { name: "Settings", path: "/admin" },
          { name: "Users", path: "/admin" },
          { name: "System Logs", path: "/admin" },
          { name: "System Configuration", path: "/admin" },
          { name: "Backup & Restore", path: "/admin" },
        ]
      },
      { 
        name: "Profile", 
        path: "/profile"
      },
    ],
    manager: [
      { 
        name: "Dashboard", 
        path: "/" 
      },
      { 
        name: "Timesheet", 
        path: "/timesheet",
        subItems: [
          { name: "My Timesheet", path: "/timesheet" },
          { name: "Team Timesheet", path: "/timesheet" },
          { name: "History", path: "/timesheet" },
        ]
      },
      { 
        name: "Projects", 
        path: "/projects",
        subItems: [
          { name: "All Projects", path: "/projects" },
          { name: "Add Project", path: "/projects" },
          { name: "Project Reports", path: "/projects" },
        ]
      },
      { 
        name: "Clients", 
        path: "/clients",
        subItems: [
          { name: "All Clients", path: "/clients" },
          { name: "Add Client", path: "/clients" },
        ]
      },
      { 
        name: "Jobs", 
        path: "/jobs",
        subItems: [
          { name: "All Jobs", path: "/jobs" },
          { name: "Add Job", path: "/jobs" },
        ]
      },
      { 
        name: "Reports", 
        path: "/reports",
        subItems: [
          { name: "Time Reports", path: "/reports" },
          { name: "Employee Reports", path: "/reports" },
          { name: "Project Reports", path: "/reports" },
        ]
      },
      { 
        name: "Leave Management", 
        path: "/leave-management",
        subItems: [
          { name: "My Leaves", path: "/leave-management" },
          { name: "Team Leaves", path: "/leave-management" },
        ]
      },
      { 
        name: "Profile", 
        path: "/profile"
      },
    ],
    user: [
      { 
        name: "Dashboard", 
        path: "/" 
      },
      { 
        name: "Timesheet", 
        path: "/timesheet",
        subItems: [
          { name: "My Timesheet", path: "/timesheet" },
          { name: "History", path: "/timesheet" },
        ]
      },
      { 
        name: "Leave Management", 
        path: "/leave-management",
        subItems: [
          { name: "My Leaves", path: "/leave-management" },
        ]
      },
      { 
        name: "Profile", 
        path: "/profile"
      },
    ],
    owner: [
      { 
        name: "Dashboard", 
        path: "/" 
      },
      { 
        name: "Timesheet", 
        path: "/timesheet",
        subItems: [
          { name: "My Timesheet", path: "/timesheet" },
          { name: "Team Timesheet", path: "/timesheet" },
        ]
      },
      { 
        name: "Reports", 
        path: "/reports",
        subItems: [
          { name: "Time Reports", path: "/reports" },
          { name: "Financial Reports", path: "/reports" },
        ]
      },
      { 
        name: "Leave Management", 
        path: "/leave-management",
        subItems: [
          { name: "My Leaves", path: "/leave-management" },
          { name: "Team Leaves", path: "/leave-management" },
        ]
      },
      { 
        name: "Profile", 
        path: "/profile"
      },
    ],
    partner: [
      { 
        name: "Dashboard", 
        path: "/" 
      },
      { 
        name: "Timesheet", 
        path: "/timesheet",
        subItems: [
          { name: "My Timesheet", path: "/timesheet" },
        ]
      },
      { 
        name: "Reports", 
        path: "/reports",
        subItems: [
          { name: "Time Reports", path: "/reports" },
        ]
      },
      { 
        name: "Leave Management", 
        path: "/leave-management",
        subItems: [
          { name: "My Leaves", path: "/leave-management" },
          { name: "Team Leaves", path: "/leave-management" },
        ]
      },
      { 
        name: "Profile", 
        path: "/profile"
      },
    ],
  };

  const items = menuItems[user.role] || [];

  const handleSectionClick = (item: any) => {
    // Navigate to the main page if it has a path
    if (item.path) {
      navigate(item.path);
    }
    // Toggle the sub-menu expansion
    toggleSection(item.name);
  };

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  const isItemActive = (item: any) => {
    if (item.path) {
      return location.pathname === item.path;
    }
    if (item.subItems) {
      return item.subItems.some((subItem: any) => location.pathname === subItem.path);
    }
    return false;
  };

  return (
    <aside className="w-64 bg-white border-r h-screen p-5">
      <h1 className="text-xl font-bold mb-8">Timesheet</h1>

      <nav className="space-y-2">
        {items.map((item) => (
          <div key={item.name}>
            {item.subItems ? (
              <>
                <button
                  className={`w-full text-left block px-3 py-2 rounded flex items-center justify-between ${
                    isItemActive(item)
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => handleSectionClick(item)}
                >
                  {item.name}
                  <span className="text-xs">
                    {expandedSections.has(item.name) ? "▼" : "▶"}
                  </span>
                </button>
                {item.subItems && expandedSections.has(item.name) && (
                  <ul className="pl-4 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          className={`block px-3 py-2 rounded text-sm ${
                            location.pathname === subItem.path
                              ? "bg-blue-100 text-blue-600"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <Link
                to={item.path!}
                className={`block px-3 py-2 rounded ${
                  location.pathname === item.path
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}