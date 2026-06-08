import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import '../../assets/css/admin.css';
import '../../assets/css/admin-users.css';

/**
 * Layout chung cho mọi route /admin/*.
 *
 * Sử dụng <Outlet/> để nested route render vào đây. Trong App.jsx
 * gắn 1 route cha "/admin" element={<AdminLayout/>} rồi nested các
 * page con bên trong.
 *
 * Import CSS ở đây để tự động kèm cho tất cả page admin.
 */
export default function AdminLayout() {
  return (
    <div className="adm-shell">
      <AdminSidebar />
      <main className="adm-content">
        <Outlet />
      </main>
    </div>
  );
}
