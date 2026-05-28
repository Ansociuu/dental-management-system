/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import { getPermissions, updateRolePermissions } from '../../services/permissionService';

const MODULE_LABELS = {
  dashboard: { label: 'Tổng quan', desc: 'Dashboard và số liệu vận hành', icon: 'dashboard' },
  appointments: { label: 'Lịch khám', desc: 'Đặt lịch, điều phối và cập nhật lịch', icon: 'calendar_month' },
  followUps: { label: 'Gọi lại sau khám', desc: 'Theo dõi và cập nhật chăm sóc sau khám', icon: 'support_agent' },
  payments: { label: 'Thanh toán', desc: 'Phiếu thu, hóa đơn và thu ngân', icon: 'receipt_long' },
  patients: { label: 'Bệnh nhân', desc: 'Danh sách và thông tin khách hàng', icon: 'groups' },
  records: { label: 'Hồ sơ bệnh án', desc: 'Lịch sử khám và dữ liệu lâm sàng', icon: 'medical_information' },
  services: { label: 'Dịch vụ', desc: 'Danh mục dịch vụ và đơn giá', icon: 'medical_services' },
  users: { label: 'Người dùng', desc: 'Tài khoản nhân viên và bác sĩ', icon: 'manage_accounts' },
  roles: { label: 'Phân quyền', desc: 'Cấu hình quyền theo vai trò', icon: 'security' },
  reports: { label: 'Báo cáo', desc: 'Doanh thu, hiệu suất và dịch vụ', icon: 'bar_chart' },
  settings: { label: 'Cấu hình', desc: 'Ca làm việc, ngày nghỉ và thiết lập', icon: 'settings' },
  doctorDuty: { label: 'Lịch trực bác sĩ', desc: 'Phân công và xem lịch trực', icon: 'clinical_notes' }
};

const ACTION_LABELS = {
  view: 'Xem',
  create: 'Thêm',
  update: 'Sửa',
  delete: 'Xóa',
  export: 'Xuất'
};

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [actions, setActions] = useState([]);
  const [selectedRole, setSelectedRole] = useState('RECEPTIONIST');
  const [draftPermissions, setDraftPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedRoleRow = useMemo(
    () => roles.find((role) => role.role === selectedRole),
    [roles, selectedRole]
  );

  const loadPermissions = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getPermissions();
      const rows = res.data || [];
      setRoles(rows);
      setModules(res.meta?.modules || []);
      setActions(res.meta?.actions || []);

      const nextRole = rows.some((row) => row.role === selectedRole)
        ? selectedRole
        : rows[0]?.role || 'RECEPTIONIST';
      setSelectedRole(nextRole);
      setDraftPermissions(rows.find((row) => row.role === nextRole)?.permissions || {});
    } catch (err) {
      setError(err.message || 'Không thể tải cấu hình phân quyền');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  useEffect(() => {
    if (selectedRoleRow) {
      setDraftPermissions(selectedRoleRow.permissions || {});
    }
  }, [selectedRoleRow?._id]);

  const togglePermission = (module, action) => {
    if (selectedRole === 'ADMIN' && module === 'roles' && ['view', 'update'].includes(action)) {
      return;
    }
    if (selectedRole === 'MANAGER' && module === 'roles') {
      return;
    }

    setDraftPermissions((prev) => ({
      ...prev,
      [module]: {
        ...(prev[module] || {}),
        [action]: !prev[module]?.[action]
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      const res = await updateRolePermissions(selectedRole, draftPermissions);
      setRoles((prev) => prev.map((role) => (role.role === selectedRole ? res.data : role)));
      setSuccess('Đã lưu cấu hình phân quyền');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.message || 'Không thể lưu cấu hình phân quyền');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold">Hệ thống</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[var(--color-primary)] font-semibold">Phân quyền</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Phân quyền chi tiết</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Cấu hình quyền truy cập theo vai trò trong hệ thống.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadPermissions}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50"
          >
            Tải lại
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">{error}</div>}
      {success && <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">{success}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Vai trò</label>
            <select
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value)}
              className="mt-1 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 bg-white"
            >
              {roles.map((role) => (
                <option key={role.role} value={role.role}>{role.label || role.role}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 text-sm text-slate-500 font-medium">
            {selectedRole === 'ADMIN'
              ? 'ADMIN luôn giữ quyền xem và sửa phân quyền để tránh khóa hệ thống.'
              : 'Thay đổi có hiệu lực sau khi người dùng tải lại phiên đăng nhập hoặc gọi lại /auth/me.'}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold">Đang tải phân quyền...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 min-w-[280px]">Module</th>
                  {actions.map((action) => (
                    <th key={action} className="px-4 py-4 text-center min-w-[90px]">{ACTION_LABELS[action] || action}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {modules.map((module) => {
                  const info = MODULE_LABELS[module] || { label: module, desc: '', icon: 'apps' };
                  return (
                    <tr key={module} className="hover:bg-slate-50/70">
                      <td className="px-6 py-5">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[21px]">{info.icon}</span>
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800">{info.label}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{info.desc}</p>
                          </div>
                        </div>
                      </td>
                      {actions.map((action) => {
                        const locked = (
                          (selectedRole === 'ADMIN' && module === 'roles' && ['view', 'update'].includes(action)) ||
                          (selectedRole === 'MANAGER' && module === 'roles')
                        );
                        return (
                          <td key={`${module}-${action}`} className="px-4 py-5 text-center">
                            <input
                              type="checkbox"
                              checked={Boolean(draftPermissions?.[module]?.[action])}
                              disabled={locked}
                              onChange={() => togglePermission(module, action)}
                              className="w-5 h-5 text-blue-700 border-slate-300 rounded focus:ring-blue-700 disabled:opacity-50"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleManagement;
