import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

// Generic hook for API requests
export interface UseApiQueryOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

export interface UseApiQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  reset: () => void;
}

export function useApiQuery<T>(
  queryFn: () => Promise<T>,
  options: UseApiQueryOptions<T> = {}
): UseApiQueryResult<T> {
  const {
    immediate = true,
    onSuccess,
    onError,
    showErrorToast = true,
    showSuccessToast = false,
    successMessage,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  const executeQuery = useCallback(async () => {
    if (!isMountedRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await queryFn();

      if (!isMountedRef.current) return;

      setData(result);

      if (onSuccess) {
        onSuccess(result);
      }

      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      const error =
        err instanceof Error ? err : new Error("An unknown error occurred");
      setError(error);

      if (onError) {
        onError(error);
      }

      if (showErrorToast) {
        toast.error(error.message);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [
    queryFn,
    onSuccess,
    onError,
    showErrorToast,
    showSuccessToast,
    successMessage,
  ]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      executeQuery();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [immediate, executeQuery]);

  return {
    data,
    isLoading,
    error,
    refetch: executeQuery,
    reset,
  };
}

// Hook for mutations (POST, PUT, DELETE operations)
export interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

export interface UseMutationResult<TData, TVariables> {
  data: TData | null;
  isLoading: boolean;
  error: Error | null;
  mutate: (variables: TVariables) => Promise<TData>;
  reset: () => void;
}

export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationResult<TData, TVariables> {
  const {
    onSuccess,
    onError,
    showErrorToast = true,
    showSuccessToast = true,
    successMessage,
  } = options;

  const [data, setData] = useState<TData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      if (!isMountedRef.current) {
        throw new Error("Component unmounted");
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await mutationFn(variables);

        if (!isMountedRef.current) {
          throw new Error("Component unmounted");
        }

        setData(result);

        if (onSuccess) {
          onSuccess(result, variables);
        }

        if (showSuccessToast) {
          toast.success(successMessage || "Operation completed successfully");
        }

        return result;
      } catch (err) {
        if (!isMountedRef.current) {
          throw err;
        }

        const error =
          err instanceof Error ? err : new Error("An unknown error occurred");
        setError(error);

        if (onError) {
          onError(error, variables);
        }

        if (showErrorToast) {
          toast.error(error.message);
        }

        throw error;
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [
      mutationFn,
      onSuccess,
      onError,
      showErrorToast,
      showSuccessToast,
      successMessage,
    ]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    mutate,
    reset,
  };
}

// Hook for paginated data
export interface UsePaginatedQueryOptions<T> extends UseApiQueryOptions<T> {
  initialPage?: number;
  initialLimit?: number;
}

export interface UsePaginatedQueryResult<T> extends UseApiQueryResult<T> {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
}

export function usePaginatedQuery<T>(
  queryFn: (
    page: number,
    limit: number
  ) => Promise<{ data: T; pagination: any }>,
  options: UsePaginatedQueryOptions<T> = {}
): UsePaginatedQueryResult<T> {
  const { initialPage = 1, initialLimit = 10, ...queryOptions } = options;

  const [page, setPageState] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });

  const wrappedQueryFn = useCallback(async () => {
    const result = await queryFn(page, limit);
    setPagination(
      result.pagination || {
        page,
        limit,
        total: 0,
        totalPages: 0,
      }
    );
    return result.data;
  }, [queryFn, page, limit]);

  const queryResult = useApiQuery(wrappedQueryFn, queryOptions);

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setPageState(1); // Reset to first page when changing limit
  }, []);

  const nextPage = useCallback(() => {
    if (page < pagination.totalPages) {
      setPage(page + 1);
    }
  }, [page, pagination.totalPages, setPage]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page, setPage]);

  const goToFirstPage = useCallback(() => {
    setPage(1);
  }, [setPage]);

  const goToLastPage = useCallback(() => {
    setPage(pagination.totalPages);
  }, [pagination.totalPages, setPage]);

  return {
    ...queryResult,
    page,
    limit,
    totalPages: pagination.totalPages,
    total: pagination.total,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
  };
}

// Hook for optimistic updates
export interface UseOptimisticUpdateOptions {
  onError?: (error: Error, rollbackFn: () => void) => void;
}

export function useOptimisticUpdate<T>(
  initialData: T | null,
  options: UseOptimisticUpdateOptions = {}
) {
  const [data, setData] = useState<T | null>(initialData);
  const [previousData, setPreviousData] = useState<T | null>(null);

  const updateOptimistically = useCallback(
    (newData: T | null) => {
      setPreviousData(data);
      setData(newData);
    },
    [data]
  );

  const rollback = useCallback(() => {
    if (previousData !== null) {
      setData(previousData);
      setPreviousData(null);
    }
  }, [previousData]);

  const commit = useCallback(() => {
    setPreviousData(null);
  }, []);

  const performOptimisticUpdate = useCallback(
    async <TVariables>(
      optimisticData: T | null,
      mutationFn: () => Promise<TVariables>
    ): Promise<TVariables> => {
      updateOptimistically(optimisticData);

      try {
        const result = await mutationFn();
        commit();
        return result;
      } catch (error) {
        rollback();
        if (options.onError) {
          options.onError(error as Error, rollback);
        }
        throw error;
      }
    },
    [updateOptimistically, commit, rollback, options]
  );

  return {
    data,
    setData,
    updateOptimistically,
    rollback,
    commit,
    performOptimisticUpdate,
    canRollback: previousData !== null,
  };
}
