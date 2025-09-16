import React, { useState, useEffect } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { departmentApi, positionApi } from "@/lib/api";
import { Department, Position, EmploymentType, WorkLocation, Status } from "@/types";

export interface EmployeeSearchFilters {
  search: string;
  departmentId: string;
  positionId: string;
  employmentType: EmploymentType | "";
  workLocation: WorkLocation | "";
  status: Status | "";
  managerName: string;
}

interface EmployeeSearchProps {
  filters: EmployeeSearchFilters;
  onFiltersChange: (filters: EmployeeSearchFilters) => void;
  onClearFilters: () => void;
}

export const EmployeeSearch: React.FC<EmployeeSearchProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    loadDepartments();
    loadPositions();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await departmentApi.getAll();
      setDepartments(response.data || []);
    } catch (error) {
      console.error("Failed to load departments:", error);
    }
  };

  const loadPositions = async () => {
    try {
      const response = await positionApi.getAll();
      setPositions(response.data || []);
    } catch (error) {
      console.error("Failed to load positions:", error);
    }
  };

  const updateFilter = (key: keyof EmployeeSearchFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.departmentId) count++;
    if (filters.positionId) count++;
    if (filters.employmentType) count++;
    if (filters.workLocation) count++;
    if (filters.status) count++;
    if (filters.managerName) count++;
    return count;
  };

  const hasActiveFilters = getActiveFiltersCount() > 0;

  return (
    <Card className="p-4">
      {/* Main Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <Input
            placeholder="Search employees by name, email, or employee ID..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Advanced Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1">
              {getActiveFiltersCount()}
            </Badge>
          )}
          <ChevronDown 
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          />
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="text-accent-error hover:text-accent-error"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-neutral-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Department
              </label>
              <Select
                value={filters.departmentId}
                onValueChange={(value) => updateFilter("departmentId", value)}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Position Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Position
              </label>
              <Select
                value={filters.positionId}
                onValueChange={(value) => updateFilter("positionId", value)}
              >
                <option value="">All Positions</option>
                {positions.map((position) => (
                  <option key={position.id} value={position.id}>
                    {position.title}
                  </option>
                ))}
              </Select>
            </div>

            {/* Employment Type Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Employment Type
              </label>
              <Select
                value={filters.employmentType}
                onValueChange={(value) => updateFilter("employmentType", value)}
              >
                <option value="">All Types</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Intern</option>
                <option value="TEMPORARY">Temporary</option>
              </Select>
            </div>

            {/* Work Location Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Work Location
              </label>
              <Select
                value={filters.workLocation}
                onValueChange={(value) => updateFilter("workLocation", value)}
              >
                <option value="">All Locations</option>
                <option value="OFFICE">Office</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => updateFilter("status", value)}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PENDING">Pending</option>
                <option value="DELETED">Deleted</option>
              </Select>
            </div>

            {/* Manager Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Manager
              </label>
              <Input
                placeholder="Manager name"
                value={filters.managerName}
                onChange={(e) => updateFilter("managerName", e.target.value)}
              />
            </div>
          </div>

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-neutral-border">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-text-secondary">Active filters:</span>
                
                {filters.search && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {filters.search}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-accent-error" 
                      onClick={() => updateFilter("search", "")}
                    />
                  </Badge>
                )}

                {filters.departmentId && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Dept: {departments.find(d => d.id === filters.departmentId)?.name}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-accent-error" 
                      onClick={() => updateFilter("departmentId", "")}
                    />
                  </Badge>
                )}

                {filters.positionId && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Position: {positions.find(p => p.id === filters.positionId)?.title}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-accent-error" 
                      onClick={() => updateFilter("positionId", "")}
                    />
                  </Badge>
                )}

                {filters.employmentType && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Type: {filters.employmentType.replace('_', ' ')}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-accent-error" 
                      onClick={() => updateFilter("employmentType", "")}
                    />
                  </Badge>
                )}

                {filters.workLocation && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Location: {filters.workLocation}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-accent-error" 
                      onClick={() => updateFilter("workLocation", "")}
                    />
                  </Badge>
                )}

                {filters.status && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Status: {filters.status.replace('_', ' ')}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-accent-error" 
                      onClick={() => updateFilter("status", "")}
                    />
                  </Badge>
                )}

                {filters.managerName && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Manager: {filters.managerName}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-accent-error" 
                      onClick={() => updateFilter("managerName", "")}
                    />
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
