import { useState } from "react";
import { Search, Plus, Users, Building } from "lucide-react";

interface Department {
  id: string;
  name: string;
  description: string;
  employeeCount: number;
  manager: string;
  budget: number;
  status: "active" | "inactive";
}

// Mock data
const mockDepartments: Department[] = [
  {
    id: "1",
    name: "Engineering",
    description: "Software development and technical infrastructure",
    employeeCount: 45,
    manager: "John Smith",
    budget: 2500000,
    status: "active",
  },
  {
    id: "2",
    name: "Marketing",
    description: "Brand promotion and customer acquisition",
    employeeCount: 12,
    manager: "Sarah Johnson",
    budget: 800000,
    status: "active",
  },
  {
    id: "3",
    name: "Human Resources",
    description: "Employee management and organizational development",
    employeeCount: 8,
    manager: "Mike Wilson",
    budget: 450000,
    status: "active",
  },
  {
    id: "4",
    name: "Finance",
    description: "Financial planning and accounting operations",
    employeeCount: 15,
    manager: "Emily Davis",
    budget: 600000,
    status: "active",
  },
  {
    id: "5",
    name: "Sales",
    description: "Revenue generation and client relationships",
    employeeCount: 28,
    manager: "David Brown",
    budget: 1200000,
    status: "active",
  },
  {
    id: "6",
    name: "Operations",
    description: "Daily business operations and logistics",
    employeeCount: 20,
    manager: "Lisa Anderson",
    budget: 750000,
    status: "inactive",
  },
];

export function Departments() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDepartments = mockDepartments.filter((department) =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    department.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600">Manage organizational departments and their structure</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Departments</p>
              <p className="text-2xl font-bold text-gray-900">{mockDepartments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockDepartments.reduce((sum, dept) => sum + dept.employeeCount, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Departments</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockDepartments.filter(dept => dept.status === "active").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Departments Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDepartments.map((department) => (
                <tr key={department.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{department.name}</div>
                      <div className="text-sm text-gray-500">{department.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{department.manager}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{department.employeeCount}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(department.budget)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      department.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {department.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredDepartments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No departments found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
