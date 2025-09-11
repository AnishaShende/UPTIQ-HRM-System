import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Search, 
  Plus, 
  Users, 
  Building, 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  UserCheck,
  DollarSign,
  TrendingUp,
  Building2,
  Briefcase,
  Target,
  PieChart
} from "lucide-react";
import { Department } from "../types";
import { departmentApi, employeeApi } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Spinner } from "../components/ui/spinner";
import { toast } from "sonner";
import { formatCurrency } from "../lib/utils";

interface DepartmentModalProps {
  department?: Department;
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'create' | 'edit';
}

interface DepartmentHierarchyProps {
  departments: Department[];
  onSelectDepartment: (dept: Department) => void;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({ department, isOpen, onClose, mode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {mode === 'create' ? 'Add New Department' : 
             mode === 'edit' ? 'Edit Department' : 'Department Details'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          {mode === 'view' && department ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{department.name}</h3>
                  <p className="text-gray-600">{department.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Manager</label>
                    <p className="text-sm text-gray-900">{department.manager?.firstName} {department.manager?.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employee Count</label>
                    <p className="text-sm text-gray-900">{department.employees?.length || 0}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created Date</label>
                    <p className="text-sm text-gray-900">{new Date(department.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <Badge variant="success">Active</Badge>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Department Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  defaultValue={department?.name || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  defaultValue={department?.description || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Manager</label>
                <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select Manager</option>
                  {/* Manager options would be populated from employees API */}
                </select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit">
                  {mode === 'create' ? 'Create Department' : 'Update Department'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const DepartmentHierarchy: React.FC<DepartmentHierarchyProps> = ({ departments, onSelectDepartment }) => {
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());

  const toggleExpanded = (deptId: string) => {
    const newExpanded = new Set(expandedDepts);
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId);
    } else {
      newExpanded.add(deptId);
    }
    setExpandedDepts(newExpanded);
  };

  const renderDepartment = (dept: Department, level: number = 0) => {
    const hasSubDepartments = dept.subDepartments && dept.subDepartments.length > 0;
    const isExpanded = expandedDepts.has(dept.id);

    return (
      <div key={dept.id} className="space-y-2">
        <div 
          className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
          style={{ marginLeft: `${level * 20}px` }}
        >
          {hasSubDepartments ? (
            <button
              onClick={() => toggleExpanded(dept.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-6 h-6" />
          )}
          
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          
          <div 
            className="flex-1 cursor-pointer"
            onClick={() => onSelectDepartment(dept)}
          >
            <div className="font-medium text-gray-900">{dept.name}</div>
            <div className="text-sm text-gray-500">
              {dept.employees?.length || 0} employees
            </div>
          </div>
        </div>
        
        {hasSubDepartments && isExpanded && dept.subDepartments?.map((subDept) => 
          renderDepartment(subDept, level + 1)
        )}
      </div>
    );
  };

  const rootDepartments = departments.filter(dept => !dept.parentDepartment);

  return (
    <div className="space-y-2">
      {rootDepartments.map(dept => renderDepartment(dept))}
    </div>
  );
};

export function Departments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedView, setSelectedView] = useState<'grid' | 'hierarchy' | 'table'>('grid');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | undefined>();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'view' | 'create' | 'edit';
  }>({
    isOpen: false,
    mode: 'view'
  });

  const queryClient = useQueryClient();

  // Fetch departments with real API integration
  const {
    data: departmentsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['departments', searchTerm],
    queryFn: () => departmentApi.getAll({
      search: searchTerm || undefined,
    }),
    staleTime: 5 * 60 * 1000,
  });

  // Delete department mutation
  const deleteDepartmentMutation = useMutation({
    mutationFn: departmentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete department');
    },
  });

  const handleOpenModal = (mode: 'view' | 'create' | 'edit', department?: Department) => {
    setSelectedDepartment(department);
    setModalState({ isOpen: true, mode });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, mode: 'view' });
    setSelectedDepartment(undefined);
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      deleteDepartmentMutation.mutate(departmentId);
    }
  };

  // Use mock data as fallback
  const departments = departmentsData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error loading departments
          </h3>
          <p className="text-gray-500">
            Unable to load department data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-1">Manage organizational departments and their structure</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <PieChart className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => handleOpenModal('create')}>
            <Building2 className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
                <p className="text-sm text-gray-500">Total Departments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {departments.reduce((sum, dept) => sum + (dept.employees?.length || 0), 0)}
                </p>
                <p className="text-sm text-gray-500">Total Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {departments.filter(dept => dept.manager).length}
                </p>
                <p className="text-sm text-gray-500">With Managers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(departments.reduce((sum, dept) => sum + (dept.employees?.length || 0), 0) / departments.length) || 0}
                </p>
                <p className="text-sm text-gray-500">Avg Team Size</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and View Toggle */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search departments by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setSelectedView('grid')}
                className={`px-4 py-2 text-sm font-medium ${selectedView === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
              >
                <Building className="h-4 w-4 mr-2 inline" />
                Grid
              </button>
              <button
                onClick={() => setSelectedView('hierarchy')}
                className={`px-4 py-2 text-sm font-medium ${selectedView === 'hierarchy' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
              >
                <Target className="h-4 w-4 mr-2 inline" />
                Hierarchy
              </button>
              <button
                onClick={() => setSelectedView('table')}
                className={`px-4 py-2 text-sm font-medium ${selectedView === 'table' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
              >
                <Briefcase className="h-4 w-4 mr-2 inline" />
                Table
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department Views */}
      {selectedView === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => (
            <Card key={department.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{department.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{department.description}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Manager</span>
                    <span className="text-sm font-medium text-gray-900">
                      {department.manager ? `${department.manager.firstName} ${department.manager.lastName}` : 'Not assigned'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Employees</span>
                    <span className="text-sm font-medium text-gray-900">{department.employees?.length || 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenModal('view', department)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenModal('edit', department)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedView === 'hierarchy' && (
        <Card>
          <CardHeader>
            <CardTitle>Organization Hierarchy</CardTitle>
          </CardHeader>
          <CardContent>
            <DepartmentHierarchy 
              departments={departments} 
              onSelectDepartment={(dept) => handleOpenModal('view', dept)}
            />
          </CardContent>
        </Card>
      )}

      {selectedView === 'table' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
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
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {departments.map((department) => (
                    <tr key={department.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{department.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{department.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {department.manager ? `${department.manager.firstName} ${department.manager.lastName}` : 'Not assigned'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{department.employees?.length || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(department.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenModal('view', department)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenModal('edit', department)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDepartment(department.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {departments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first department.
            </p>
            <Button onClick={() => handleOpenModal('create')}>
              <Building2 className="h-4 w-4 mr-2" />
              Create First Department
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Department Modal */}
      <DepartmentModal
        department={selectedDepartment}
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        mode={modalState.mode}
      />
    </div>
  );
}
