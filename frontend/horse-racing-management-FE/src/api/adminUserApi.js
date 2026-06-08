import axiosInstance from './axiosInstance';

/**
 * GET /api/admin/users
 * Lấy danh sách user có phân trang, lọc theo keyword/role/status.
 *
 * @param {Object} params
 * @param {number} [params.page=0]   Trang hiện tại (0-indexed theo Spring)
 * @param {number} [params.size=10]  Số bản ghi / trang
 * @param {string} [params.keyword]  Từ khoá tìm kiếm (username/email/fullName)
 * @param {string} [params.role]     Lọc theo role (enum)
 * @param {string} [params.status]   Lọc theo status (enum)
 * @param {AbortSignal} [signal]     Signal để huỷ request khi params thay đổi
 *
 * @returns {Promise<{content: any[], page: number, size: number,
 *                    totalElements: number, totalPages: number,
 *                    first: boolean, last: boolean}>}
 */
export const getUsers = ({ page = 0, size = 10, keyword, role, status } = {}, signal) => {
  // Chỉ gửi những param có giá trị (axios sẽ bỏ qua undefined)
  const params = { page, size };
  if (keyword?.trim()) params.keyword = keyword.trim();
  if (role)            params.role    = role;
  if (status)          params.status  = status;

  return axiosInstance
    .get('/admin/users', { params, signal })
    .then((res) => res.data.data);
};

/**
 * PUT /api/admin/users/{id}/role
 * Cập nhật role cho 1 user.
 */
export const updateUserRole = (id, roleName) =>
  axiosInstance
    .put(`/admin/users/${id}/role`, { roleName })
    .then((res) => res.data);

/**
 * PUT /api/admin/users/{id}/status
 * Cập nhật trạng thái cho 1 user (ACTIVE | INACTIVE | BANNED).
 */
export const updateUserStatus = (id, status) =>
  axiosInstance
    .put(`/admin/users/${id}/status`, { status })
    .then((res) => res.data);
