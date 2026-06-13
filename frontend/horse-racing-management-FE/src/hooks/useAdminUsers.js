import { useCallback, useEffect, useState } from 'react';
import { getUsers } from '../api/adminApi';

export function useAdminUsers({ keyword = '', role = '', status = '', page = 0, size = 10 } = {}) {
  const [users, setUsers] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers({ keyword, role, status, page: currentPage, size });
      setUsers(data.content ?? []);
      setTotalElements(data.totalElements ?? 0);
      setTotalPages(data.totalPages ?? 0);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [keyword, role, status, currentPage, size]);

  useEffect(() => { fetch(); }, [fetch]);

  return { users, totalElements, totalPages, currentPage, setCurrentPage, loading, error, refetch: fetch };
}