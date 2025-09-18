import { useApiQuery, useMutation, usePaginatedQuery } from "./useApi";
import {
  employeeService,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  CreatePositionRequest,
  UpdatePositionRequest,
  EmployeeFilters,
} from "../services/employeeService";

// Employee hooks
export function useEmployees(filters?: EmployeeFilters) {
  return usePaginatedQuery(
    async (page: number, limit: number) => {
      const result = await employeeService.getEmployees({
        ...filters,
        page,
        limit,
      });
      return {
        data: result.employees,
        pagination: result.pagination,
      };
    },
    {
      immediate: true,
    }
  );
}

export function useEmployee(id: string | null) {
  return useApiQuery(
    () => {
      if (!id) throw new Error("Employee ID is required");
      return employeeService.getEmployee(id);
    },
    {
      immediate: !!id,
    }
  );
}

export function useCreateEmployee() {
  return useMutation(
    (data: CreateEmployeeRequest) => employeeService.createEmployee(data),
    {
      successMessage: "Employee created successfully",
    }
  );
}

export function useUpdateEmployee() {
  return useMutation(
    ({ id, data }: { id: string; data: UpdateEmployeeRequest }) =>
      employeeService.updateEmployee(id, data),
    {
      successMessage: "Employee updated successfully",
    }
  );
}

export function useDeleteEmployee() {
  return useMutation((id: string) => employeeService.deleteEmployee(id), {
    successMessage: "Employee deleted successfully",
  });
}

// Department hooks
export function useDepartments() {
  return useApiQuery(() => employeeService.getDepartments(), {
    immediate: true,
  });
}

export function useDepartment(id: string | null) {
  return useApiQuery(
    () => {
      if (!id) throw new Error("Department ID is required");
      return employeeService.getDepartment(id);
    },
    {
      immediate: !!id,
    }
  );
}

export function useCreateDepartment() {
  return useMutation(
    (data: CreateDepartmentRequest) => employeeService.createDepartment(data),
    {
      successMessage: "Department created successfully",
    }
  );
}

export function useUpdateDepartment() {
  return useMutation(
    ({ id, data }: { id: string; data: UpdateDepartmentRequest }) =>
      employeeService.updateDepartment(id, data),
    {
      successMessage: "Department updated successfully",
    }
  );
}

export function useDeleteDepartment() {
  return useMutation((id: string) => employeeService.deleteDepartment(id), {
    successMessage: "Department deleted successfully",
  });
}

// Position hooks
export function usePositions() {
  return useApiQuery(() => employeeService.getPositions(), {
    immediate: true,
  });
}

export function usePosition(id: string | null) {
  return useApiQuery(
    () => {
      if (!id) throw new Error("Position ID is required");
      return employeeService.getPosition(id);
    },
    {
      immediate: !!id,
    }
  );
}

export function useCreatePosition() {
  return useMutation(
    (data: CreatePositionRequest) => employeeService.createPosition(data),
    {
      successMessage: "Position created successfully",
    }
  );
}

export function useUpdatePosition() {
  return useMutation(
    ({ id, data }: { id: string; data: UpdatePositionRequest }) =>
      employeeService.updatePosition(id, data),
    {
      successMessage: "Position updated successfully",
    }
  );
}

export function useDeletePosition() {
  return useMutation((id: string) => employeeService.deletePosition(id), {
    successMessage: "Position deleted successfully",
  });
}

// Combined hooks for forms and lists
export function useEmployeeForm(employeeId?: string) {
  const { data: employee, isLoading: isLoadingEmployee } = useEmployee(
    employeeId || null
  );
  const { data: departments, isLoading: isLoadingDepartments } =
    useDepartments();
  const { data: positions, isLoading: isLoadingPositions } = usePositions();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();

  const isLoading =
    isLoadingEmployee || isLoadingDepartments || isLoadingPositions;

  const submitEmployee = async (
    data: CreateEmployeeRequest | UpdateEmployeeRequest
  ) => {
    if (employeeId) {
      return updateEmployee.mutate({
        id: employeeId,
        data: data as UpdateEmployeeRequest,
      });
    } else {
      return createEmployee.mutate(data as CreateEmployeeRequest);
    }
  };

  return {
    employee,
    departments: departments || [],
    positions: positions || [],
    isLoading,
    isSubmitting: createEmployee.isLoading || updateEmployee.isLoading,
    submitEmployee,
    error: createEmployee.error || updateEmployee.error,
  };
}

export function useDepartmentForm(departmentId?: string) {
  const { data: department, isLoading: isLoadingDepartment } = useDepartment(
    departmentId || null
  );
  const employeesQuery = useEmployees();
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();

  const isLoading = isLoadingDepartment || employeesQuery.isLoading;

  const submitDepartment = async (
    data: CreateDepartmentRequest | UpdateDepartmentRequest
  ) => {
    if (departmentId) {
      return updateDepartment.mutate({
        id: departmentId,
        data: data as UpdateDepartmentRequest,
      });
    } else {
      return createDepartment.mutate(data as CreateDepartmentRequest);
    }
  };

  return {
    department,
    employees: employeesQuery.data || [],
    isLoading,
    isSubmitting: createDepartment.isLoading || updateDepartment.isLoading,
    submitDepartment,
    error: createDepartment.error || updateDepartment.error,
  };
}

export function usePositionForm(positionId?: string) {
  const { data: position, isLoading: isLoadingPosition } = usePosition(
    positionId || null
  );
  const { data: departments, isLoading: isLoadingDepartments } =
    useDepartments();
  const createPosition = useCreatePosition();
  const updatePosition = useUpdatePosition();

  const isLoading = isLoadingPosition || isLoadingDepartments;

  const submitPosition = async (
    data: CreatePositionRequest | UpdatePositionRequest
  ) => {
    if (positionId) {
      return updatePosition.mutate({
        id: positionId,
        data: data as UpdatePositionRequest,
      });
    } else {
      return createPosition.mutate(data as CreatePositionRequest);
    }
  };

  return {
    position,
    departments: departments || [],
    isLoading,
    isSubmitting: createPosition.isLoading || updatePosition.isLoading,
    submitPosition,
    error: createPosition.error || updatePosition.error,
  };
}
