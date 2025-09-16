import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  leaveApiService,
  LeaveQueryParams,
  LeaveBalanceQueryParams,
  CreateLeaveRequestData,
  UpdateLeaveRequestData,
  ApproveLeaveData,
  CreateLeaveBalanceData
} from '../api/leave';
// Types are imported via the API service file

// Query keys for caching
export const leaveQueryKeys = {
  all: ['leaves'] as const,
  requests: () => [...leaveQueryKeys.all, 'requests'] as const,
  request: (id: string) => [...leaveQueryKeys.requests(), id] as const,
  myRequests: () => [...leaveQueryKeys.all, 'my-requests'] as const,
  pendingApprovals: () => [...leaveQueryKeys.all, 'pending-approvals'] as const,
  employeeHistory: (employeeId: string) => [...leaveQueryKeys.all, 'employee-history', employeeId] as const,
  
  balances: () => [...leaveQueryKeys.all, 'balances'] as const,
  balance: (id: string) => [...leaveQueryKeys.balances(), id] as const,
  myBalance: () => [...leaveQueryKeys.all, 'my-balance'] as const,
  employeeBalance: (employeeId: string) => [...leaveQueryKeys.balances(), 'employee', employeeId] as const,
  
  types: () => [...leaveQueryKeys.all, 'types'] as const,
  type: (id: string) => [...leaveQueryKeys.types(), id] as const,
  
  comments: (leaveId: string) => [...leaveQueryKeys.all, 'comments', leaveId] as const,
  stats: () => [...leaveQueryKeys.all, 'stats'] as const,
};

// ==================== LEAVE REQUESTS HOOKS ====================

/**
 * Hook to fetch all leave requests with filtering and pagination
 */
export const useLeaveRequests = (params?: LeaveQueryParams) => {
  return useQuery({
    queryKey: [...leaveQueryKeys.requests(), params],
    queryFn: () => leaveApiService.getLeaveRequests(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch current user's leave requests
 */
export const useMyLeaveRequests = (params?: LeaveQueryParams) => {
  return useQuery({
    queryKey: [...leaveQueryKeys.myRequests(), params],
    queryFn: () => leaveApiService.getMyLeaveRequests(params),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch a specific leave request by ID
 */
export const useLeaveRequest = (id: string) => {
  return useQuery({
    queryKey: leaveQueryKeys.request(id),
    queryFn: () => leaveApiService.getLeaveRequestById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch pending leave requests for approval
 */
export const usePendingApprovals = (params?: LeaveQueryParams) => {
  return useQuery({
    queryKey: [...leaveQueryKeys.pendingApprovals(), params],
    queryFn: () => leaveApiService.getPendingApprovals(params),
    staleTime: 2 * 60 * 1000, // 2 minutes for more frequent updates
  });
};

/**
 * Hook to fetch employee leave history
 */
export const useEmployeeLeaveHistory = (employeeId: string, year?: number) => {
  return useQuery({
    queryKey: [...leaveQueryKeys.employeeHistory(employeeId), year],
    queryFn: () => leaveApiService.getEmployeeLeaveHistory(employeeId, year),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create a new leave request
 */
export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeaveRequestData) => leaveApiService.createLeaveRequest(data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: leaveQueryKeys.requests() });
      queryClient.invalidateQueries({ queryKey: leaveQueryKeys.myRequests() });
      queryClient.invalidateQueries({ queryKey: leaveQueryKeys.myBalance() });
      queryClient.invalidateQueries({ queryKey: leaveQueryKeys.stats() });
      
      toast.success('Leave request created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create leave request');
    },
  });
};

/**
 * Hook to update a leave request
 */
export const useUpdateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeaveRequestData }) => 
      leaveApiService.updateLeaveRequest(id, data),
    onSuccess: (data, variables) => {
      // Update specific request cache
      queryClient.setQueryData(leaveQueryKeys.request(variables.id), data);
      
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: leaveQueryKeys.requests() });
      queryClient.invalidateQueries({ queryKey: leaveQueryKeys.myRequests() });
      
      toast.success('Leave request updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update leave request');
    },
  });
};

/**
 * Hook to approve or reject a leave request
 */
export const useApproveLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveLeaveData }) => 
      leaveApiService.approveLeaveRequest(id, data),
    onSuccess: (data, variables) => {
      // Update specific request cache
      queryClient.setQueryData(leaveQueryKeys.request(variables.id), data);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: leaveQueryKeys.requests() });
      queryClient.invalidateQueries({ queryKey: leaveQueryKeys.pendingApprovals() });
      queryClient.invalidateQueries({ queryKey: leaveQueryKeys.balances() });
      queryClient.invalidateQueries({ queryKey: leaveQueryKeys.stats() });
      
      const action = variables.data.action.toLowerCase();
      toast.success(`Leave request ${action}d successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to process leave request');
    },
  });
};

/**
 * Hook to cancel a leave request
 */
export const useCancelLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      leaveApiService.cancelLeaveRequest(id, reason),
    onSuccess: (data, variables) => {
      // Update specific request cache
      queryClient.setQueryData(leaveQueryKeys.request(variables.id), data);
      
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: leaveQueryKeys.requests() });
      queryClient.invalidateQueries({ queryKey: leaveQueryKeys.myRequests() });
      queryClient.invalidateQueries({ queryKey: leaveQueryKeys.balances() });
      
      toast.success('Leave request cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel leave request');
    },
  });
};

/**
 * Hook to delete a leave request
 */
export const useDeleteLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leaveApiService.deleteLeaveRequest(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: leaveQueryKeys.request(id) });
      
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: leaveQueryKeys.requests() });
      queryClient.invalidateQueries({ queryKey: leaveQueryKeys.myRequests() });
      
      toast.success('Leave request deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete leave request');
    },
  });
};

// ==================== LEAVE BALANCES HOOKS ====================

/**
 * Hook to fetch all leave balances
 */
export const useLeaveBalances = (params?: LeaveBalanceQueryParams) => {
  return useQuery({
    queryKey: [...leaveQueryKeys.balances(), params],
    queryFn: () => leaveApiService.getLeaveBalances(params),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch current user's leave balance
 */
export const useMyLeaveBalance = (year?: number) => {
  return useQuery({
    queryKey: [...leaveQueryKeys.myBalance(), year],
    queryFn: () => leaveApiService.getMyLeaveBalance(year),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch leave balance by ID
 */
export const useLeaveBalance = (id: string) => {
  return useQuery({
    queryKey: leaveQueryKeys.balance(id),
    queryFn: () => leaveApiService.getLeaveBalanceById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch employee leave balances
 */
export const useEmployeeLeaveBalances = (employeeId: string, year?: number) => {
  return useQuery({
    queryKey: [...leaveQueryKeys.employeeBalance(employeeId), year],
    queryFn: () => leaveApiService.getEmployeeLeaveBalances(employeeId, year),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create a new leave balance
 */
export const useCreateLeaveBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeaveBalanceData) => leaveApiService.createLeaveBalance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveQueryKeys.balances() });
      toast.success('Leave balance created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create leave balance');
    },
  });
};

/**
 * Hook to update a leave balance
 */
export const useUpdateLeaveBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateLeaveBalanceData> }) => 
      leaveApiService.updateLeaveBalance(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(leaveQueryKeys.balance(variables.id), data);
      queryClient.invalidateQueries({ queryKey: leaveQueryKeys.balances() });
      toast.success('Leave balance updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update leave balance');
    },
  });
};

/**
 * Hook to delete a leave balance
 */
export const useDeleteLeaveBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leaveApiService.deleteLeaveBalance(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: leaveQueryKeys.balance(id) });
      queryClient.invalidateQueries({ queryKey: leaveQueryKeys.balances() });
      toast.success('Leave balance deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete leave balance');
    },
  });
};

/**
 * Hook to initialize yearly balances for an employee
 */
export const useInitializeYearlyBalances = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, year }: { employeeId: string; year: number }) => 
      leaveApiService.initializeYearlyBalances(employeeId, year),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveQueryKeys.balances() });
      toast.success('Yearly balances initialized successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to initialize yearly balances');
    },
  });
};

// ==================== LEAVE TYPES HOOKS ====================

/**
 * Hook to fetch all leave types
 */
export const useLeaveTypes = () => {
  return useQuery({
    queryKey: leaveQueryKeys.types(),
    queryFn: () => leaveApiService.getLeaveTypes(),
    staleTime: 10 * 60 * 1000, // 10 minutes (leave types don't change often)
  });
};

/**
 * Hook to fetch leave type by ID
 */
export const useLeaveType = (id: string) => {
  return useQuery({
    queryKey: leaveQueryKeys.type(id),
    queryFn: () => leaveApiService.getLeaveTypeById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

// ==================== LEAVE STATISTICS HOOKS ====================

/**
 * Hook to fetch leave statistics
 */
export const useLeaveStats = (year?: number) => {
  return useQuery({
    queryKey: [...leaveQueryKeys.stats(), year],
    queryFn: () => leaveApiService.getLeaveStats(year),
    staleTime: 5 * 60 * 1000,
  });
};

// ==================== LEAVE COMMENTS HOOKS ====================

/**
 * Hook to fetch comments for a leave request
 */
export const useLeaveComments = (leaveId: string) => {
  return useQuery({
    queryKey: leaveQueryKeys.comments(leaveId),
    queryFn: () => leaveApiService.getLeaveComments(leaveId),
    enabled: !!leaveId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to add a comment to a leave request
 */
export const useAddLeaveComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leaveId, data }: { leaveId: string; data: { content: string; isInternal?: boolean } }) => 
      leaveApiService.addLeaveComment(leaveId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leaveQueryKeys.comments(variables.leaveId) });
      toast.success('Comment added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add comment');
    },
  });
};

/**
 * Hook to upload attachments for a leave request
 */
export const useUploadLeaveAttachments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }) => 
      leaveApiService.uploadLeaveAttachments(id, files),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(leaveQueryKeys.request(variables.id), data.data.leave);
      queryClient.invalidateQueries({ queryKey: leaveQueryKeys.requests() });
      toast.success('Attachments uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload attachments');
    },
  });
};
