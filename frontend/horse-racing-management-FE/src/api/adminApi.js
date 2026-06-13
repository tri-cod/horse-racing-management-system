import axiosInstance from './axiosInstance';

export const getUsers = ({ page = 0, size = 10, keyword, role, status } = {}) => {
  const params = { page, size };
  if (keyword) params.keyword = keyword;
  if (role) params.role = role;
  if (status) params.status = status;
  return axiosInstance.get('/admin/users', { params }).then((res) => res.data.data);
};

export const updateUserRole = (id, roleName) =>
  axiosInstance.put(`/admin/users/${id}/role`, { roleName }).then((res) => res.data.data);

export const updateUserStatus = (id, status) =>
  axiosInstance.put(`/admin/users/${id}/status`, { status }).then((res) => res.data.data);