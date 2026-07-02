import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/api/adminApi';
import type { User, UserRole, UserStatus } from '@/types';

interface UseAdminUsersOptions {
 keyword?: string;
 role?: UserRole | '';
 status?: UserStatus | '';
 page?: number;
 size?: number;
}

export function useAdminUsers({
 keyword = '',
 role = '',
 status = '',
 page = 0,
 size = 10,
}: UseAdminUsersOptions = {}) {
 const [currentPage, setCurrentPage] = useState(page);

 const { data, isLoading, error, refetch } = useQuery<{
 content: User[];
 totalElements: number;
 totalPages: number;
 }>({
 queryKey: ['admin-users', keyword, role, status, currentPage, size],
 queryFn: () => getUsers({
 keyword: keyword || undefined,
 role: (role as UserRole) || undefined,
 status: (status as UserStatus) || undefined,
 page: currentPage,
 size,
 }),
 });

 return {
 users: data?.content ?? [],
 totalElements: data?.totalElements ?? 0,
 totalPages: data?.totalPages ?? 0,
 currentPage,
 setCurrentPage,
 loading: isLoading,
 error: error ? (error as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message ?? 'Failed to load users' : null,
 refetch,
 };
}
