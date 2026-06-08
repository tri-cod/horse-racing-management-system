import { useState, useEffect, useRef, useCallback } from 'react';
import { getUsers, updateUserRole, updateUserStatus } from '../api/adminUserApi';

/**
 * Hook quản lý state cho trang Admin → Users.
 *
 * Trách nhiệm:
 *  - Lấy danh sách user theo page/size/keyword/role/status.
 *  - Debounce ô tìm kiếm 350ms để không gọi API mỗi lần gõ phím.
 *  - Huỷ request cũ khi filter thay đổi (AbortController).
 *  - Tự reset về trang 0 khi filter / pageSize thay đổi.
 *  - Cung cấp action đổi role / đổi status, kèm refetch sau khi thành công.
 */
export function useAdminUsers() {
  // ---- Filter state ---------------------------------------------------------
  const [keywordInput, setKeywordInput] = useState(''); // giá trị đang gõ
  const [keyword, setKeyword]           = useState(''); // giá trị sau debounce
  const [role, setRole]                 = useState('');
  const [status, setStatus]             = useState('');

  // ---- Pagination state -----------------------------------------------------
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // ---- Data state -----------------------------------------------------------
  const [data, setData]       = useState({
    content: [], page: 0, size: 10, totalElements: 0, totalPages: 0,
    first: true, last: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // ID user đang được mutate (để show spinner trên đúng row đó)
  const [mutatingId, setMutatingId] = useState(null);

  // ---- Debounce keyword ----------------------------------------------------
  useEffect(() => {
    const t = setTimeout(() => setKeyword(keywordInput.trim()), 350);
    return () => clearTimeout(t);
  }, [keywordInput]);

  // ---- Reset về trang 0 khi đổi filter / size ------------------------------
  useEffect(() => {
    setPage(0);
  }, [keyword, role, status, size]);

  // ---- Fetch list ----------------------------------------------------------
  // Tách thành hàm riêng để có thể gọi refetch sau khi mutate
  const fetchList = useCallback((signal) => {
    setLoading(true);
    setError('');
    return getUsers({ page, size, keyword, role, status }, signal)
      .then((res) => setData(res))
      .catch((err) => {
        // Bỏ qua lỗi do mình tự huỷ
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        setError(err.response?.data?.message || 'Unable to load user list.');
      })
      .finally(() => setLoading(false));
  }, [page, size, keyword, role, status]);

  // Re-fetch mỗi khi filter / pagination thay đổi
  useEffect(() => {
    const ctrl = new AbortController();
    fetchList(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchList]);

  // ---- Actions -------------------------------------------------------------
  /** Đổi role; trả về Promise resolve với message để page show toast */
  const changeRole = async (userId, newRole) => {
    setMutatingId(userId);
    try {
      await updateUserRole(userId, newRole);
await fetchList(undefined); // refetch cho chắc, vì role thay đổi có thể ảnh hưởng lọc
      return { success: true, message: 'Role updated.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'The role update failed.',
      };
    } finally {
      setMutatingId(null);
    }
  };

  /** Toggle BANNED ⇌ ACTIVE; nhận thêm currentStatus để biết hướng */
  const toggleBan = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'BANNED' ? 'ACTIVE' : 'BANNED';
    setMutatingId(userId);
    try {
      await updateUserStatus(userId, nextStatus);
      await fetchList();
      return {
        success: true,
        message: nextStatus === 'BANNED'
          ? 'Account locked.'
          : 'Account unlocked.',
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message
          || (nextStatus === 'BANNED' ? 'Account banned.' : 'Account unbanned.'),
      };
    } finally {
      setMutatingId(null);
    }
  };

  const resetFilters = () => {
    setKeywordInput('');
    setKeyword('');
    setRole('');
    setStatus('');
    setPage(0);
  };

  return {
    // dữ liệu
    users:    data.content,
    pageInfo: {
      page:          data.page,
      size:          data.size,
      totalElements: data.totalElements,
      totalPages:    data.totalPages,
      first:         data.first,
      last:          data.last,
    },
    loading, error, mutatingId,

    // filter
    keywordInput, role, status,
    setKeywordInput, setRole, setStatus,

    // pagination
    setPage, setSize,

    // actions
    changeRole, toggleBan, resetFilters,
    refetch: fetchList,
  };
}
