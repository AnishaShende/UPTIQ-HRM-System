import { useApiQuery, useMutation, usePaginatedQuery } from "./useApi";
import {
  leaveService,
  CreateLeaveRequest,
  UpdateLeaveRequest,
  LeaveActionRequest,
  LeaveFilters,
} from "../services/leaveService";

// Leave request hooks
export function useLeaveRequests(filters?: LeaveFilters) {
  return usePaginatedQuery(
    async (page: number, limit: number) => {
      const result = await leaveService.getLeaveRequests({
        ...filters,
        page,
        limit,
      });
      return {
        data: result.requests,
        pagination: result.pagination,
      };
    },
    {
      immediate: true,
    }
  );
}

export function useLeaveRequest(id: string | null) {
  return useApiQuery(
    () => {
      if (!id) throw new Error("Leave request ID is required");
      return leaveService.getLeaveRequest(id);
    },
    {
      immediate: !!id,
    }
  );
}

export function useCreateLeaveRequest() {
  return useMutation(
    (data: CreateLeaveRequest) => leaveService.createLeaveRequest(data),
    {
      successMessage: "Leave request submitted successfully",
    }
  );
}

export function useUpdateLeaveRequest() {
  return useMutation(
    ({ id, data }: { id: string; data: UpdateLeaveRequest }) =>
      leaveService.updateLeaveRequest(id, data),
    {
      successMessage: "Leave request updated successfully",
    }
  );
}

export function useReviewLeaveRequest() {
  return useMutation(
    ({ id, action }: { id: string; action: LeaveActionRequest }) =>
      leaveService.reviewLeaveRequest(id, action),
    {
      successMessage: "Leave request reviewed successfully",
    }
  );
}

export function useDeleteLeaveRequest() {
  return useMutation((id: string) => leaveService.deleteLeaveRequest(id), {
    successMessage: "Leave request deleted successfully",
  });
}

// Leave balance hooks
export function useLeaveBalances(employeeId?: string) {
  return useApiQuery(() => leaveService.getLeaveBalances(employeeId), {
    immediate: true,
  });
}

// Leave statistics hooks
export function useLeaveStats(filters?: {
  year?: number;
  departmentId?: string;
  employeeId?: string;
}) {
  return useApiQuery(() => leaveService.getLeaveStats(filters), {
    immediate: true,
  });
}

// Combined hooks for components
export function useLeaveRequestForm(requestId?: string) {
  const { data: leaveRequest, isLoading: isLoadingRequest } = useLeaveRequest(
    requestId || null
  );
  const createLeaveRequest = useCreateLeaveRequest();
  const updateLeaveRequest = useUpdateLeaveRequest();

  const isLoading = isLoadingRequest;

  const submitLeaveRequest = async (
    data: CreateLeaveRequest | UpdateLeaveRequest
  ) => {
    if (requestId) {
      return updateLeaveRequest.mutate({
        id: requestId,
        data: data as UpdateLeaveRequest,
      });
    } else {
      return createLeaveRequest.mutate(data as CreateLeaveRequest);
    }
  };

  return {
    leaveRequest,
    isLoading,
    isSubmitting: createLeaveRequest.isLoading || updateLeaveRequest.isLoading,
    submitLeaveRequest,
    error: createLeaveRequest.error || updateLeaveRequest.error,
  };
}

export function useLeaveManagement() {
  const leaveRequestsQuery = useLeaveRequests();
  const leaveBalancesQuery = useLeaveBalances();
  const leaveStatsQuery = useLeaveStats();
  const reviewLeaveRequest = useReviewLeaveRequest();

  const approveLeave = async (id: string, comments?: string) => {
    return reviewLeaveRequest.mutate({
      id,
      action: { action: "APPROVE", comments },
    });
  };

  const rejectLeave = async (id: string, comments?: string) => {
    return reviewLeaveRequest.mutate({
      id,
      action: { action: "REJECT", comments },
    });
  };

  const refetchAll = async () => {
    await Promise.all([
      leaveRequestsQuery.refetch(),
      leaveBalancesQuery.refetch(),
      leaveStatsQuery.refetch(),
    ]);
  };

  return {
    leaveRequests: leaveRequestsQuery.data || [],
    leaveBalances: leaveBalancesQuery.data || [],
    leaveStats: leaveStatsQuery.data,
    isLoading:
      leaveRequestsQuery.isLoading ||
      leaveBalancesQuery.isLoading ||
      leaveStatsQuery.isLoading,
    isReviewing: reviewLeaveRequest.isLoading,
    approveLeave,
    rejectLeave,
    refetchAll,
    pagination: {
      page: leaveRequestsQuery.page,
      limit: leaveRequestsQuery.limit,
      total: leaveRequestsQuery.total,
      totalPages: leaveRequestsQuery.totalPages,
      setPage: leaveRequestsQuery.setPage,
      setLimit: leaveRequestsQuery.setLimit,
      nextPage: leaveRequestsQuery.nextPage,
      prevPage: leaveRequestsQuery.prevPage,
    },
  };
}

export function useEmployeeLeaves(employeeId: string) {
  const leaveRequestsQuery = useLeaveRequests({ employeeId });
  const leaveBalancesQuery = useLeaveBalances(employeeId);
  const createLeaveRequest = useCreateLeaveRequest();

  const submitNewLeave = async (data: CreateLeaveRequest) => {
    const result = await createLeaveRequest.mutate(data);
    // Refetch data after creating
    await Promise.all([
      leaveRequestsQuery.refetch(),
      leaveBalancesQuery.refetch(),
    ]);
    return result;
  };

  return {
    leaveRequests: leaveRequestsQuery.data || [],
    leaveBalances: leaveBalancesQuery.data || [],
    isLoading: leaveRequestsQuery.isLoading || leaveBalancesQuery.isLoading,
    isSubmitting: createLeaveRequest.isLoading,
    submitNewLeave,
    refetch: async () => {
      await Promise.all([
        leaveRequestsQuery.refetch(),
        leaveBalancesQuery.refetch(),
      ]);
    },
    pagination: {
      page: leaveRequestsQuery.page,
      limit: leaveRequestsQuery.limit,
      total: leaveRequestsQuery.total,
      totalPages: leaveRequestsQuery.totalPages,
      setPage: leaveRequestsQuery.setPage,
      setLimit: leaveRequestsQuery.setLimit,
      nextPage: leaveRequestsQuery.nextPage,
      prevPage: leaveRequestsQuery.prevPage,
    },
  };
}
