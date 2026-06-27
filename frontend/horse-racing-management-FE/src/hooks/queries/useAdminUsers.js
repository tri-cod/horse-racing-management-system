import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../api/adminApi';

export function useAdminUsers({ keyword = '', role = '', status = '', page = 0, size = 10 } = {}) {
  const [currentPage, setCurrentPage] = useState(page);

  const query = useQuery({
    queryKey: ['admin-users', { keyword, role, status, page: currentPage, size }],
    queryFn: () => getUsers({ keyword, role, status, page: currentPage, size }),
  });

  return {
    users: query.data?.content ?? [],
    totalElements: query.data?.totalElements ?? 0,
    totalPages: query.data?.totalPages ?? 0,
    currentPage,
    setCurrentPage,
    loading: query.isLoading,
    error: query.error?.response?.data?.message || query.error?.message || null,
    refetch: query.refetch,
  };
}
