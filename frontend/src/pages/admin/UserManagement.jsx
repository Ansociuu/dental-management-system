/* eslint-disable no-unused-vars, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const roleMap = {
  'MANAGER': 'Quản lý',
  'ADMIN': 'Quản trị viên',
  'DOCTOR': 'Bác sĩ',
  'NURSE': 'Y tá',
  'RECEPTIONIST': 'Lễ tân'
};

const roleMapRev = {
  'Quản lý': 'MANAGER',
  'Quản trị viên': 'ADMIN',
  'Bác sĩ': 'DOCTOR',
  'Y tá': 'NURSE',
  'Lễ tân': 'RECEPTIONIST'
};

const statusMap = {
  'ACTIVE': 'Hoạt động',
  'INACTIVE': 'Tạm khóa'
};

const statusMapRev = {
  'Hoạt động': 'ACTIVE',
  'Tạm khóa': 'INACTIVE'
};

const UserManagement = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const emptyUserForm = {
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'DOCTOR',
    status: 'ACTIVE',
    specialization: '',
    licenseNumber: ''
  };
  const [newUser, setNewUser] = useState(emptyUserForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (roleFilter) params.role = roleFilter;

      const res = await getUsers(params);
      setUsers(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!isAdmin && ['ADMIN', 'MANAGER'].includes(newUser.role)) {
      setError('Quản lý không được tạo hoặc gán vai trò quản trị/quản lý.');
      return;
    }

    setError(''); setSuccess('');
    try {
      if (editingId) {
        await updateUser(editingId, newUser);
        setSuccess('Cập nhật người dùng thành công!');
      } else {
        await createUser(newUser);
        setSuccess('Thêm người dùng mới thành công!');
      }
      setIsAddModalOpen(false);
      setEditingId(null);
      setNewUser(emptyUserForm);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (u) => {
    if (!isAdmin && ['ADMIN', 'MANAGER'].includes(u.role)) {
      setError('Quản lý không được chỉnh sửa tài khoản quản trị hoặc quản lý khác.');
      return;
    }

    setEditingId(u._id);
    setNewUser({
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.status,
      specialization: u.specialization || '',
      licenseNumber: u.licenseNumber || ''
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id) => {
    const targetUser = users.find((item) => item._id === id);
    if (!isAdmin && targetUser && ['ADMIN', 'MANAGER'].includes(targetUser.role)) {
      setError('Quản lý không được xóa tài khoản quản trị hoặc quản lý khác.');
      return;
    }

    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    setError(''); setSuccess('');
    try {
      await deleteUser(id);
      setSuccess('Xóa tài khoản người dùng thành công!');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleStatus = async (user) => {
    if (!isAdmin && ['ADMIN', 'MANAGER'].includes(user.role)) {
      setError('Quản lý không được khóa hoặc mở khóa tài khoản quản trị/quản lý.');
      return;
    }

    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateUser(user._id, { status: nextStatus });
      setSuccess(`Đã chuyển trạng thái người dùng sang ${statusMap[nextStatus]}!`);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'MANAGER': return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200';
      case 'DOCTOR': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'NURSE': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'RECEPTIONIST': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PATIENT': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'ACTIVE') return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-rose-100 text-rose-700 border-rose-200';
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 relative">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold">Cấu hình hệ thống</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[var(--color-primary)] font-semibold">Quản lý người dùng</span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Người dùng</h1>
            <span className="bg-gradient-to-r from-blue-50 to-indigo-50 text-[var(--color-primary)] border border-blue-100 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
              {users.length} tài khoản
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setEditingId(null); setNewUser(emptyUserForm); setError(''); setIsAddModalOpen(true); }}
            className="flex items-center gap-2 bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white px-7 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Thêm người dùng
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">{error}</div>}
      {success && <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">{success}</div>}

      {/* Main Content */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên, email, SĐT..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <select 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)} 
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 font-semibold text-sm outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="manager">Quản lý</option>
              <option value="">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="doctor">Bác sĩ</option>
              <option value="nurse">Y tá</option>
              <option value="receptionist">Lễ tân</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-medium">Đang tải danh sách tài khoản...</div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <span className="material-symbols-outlined text-[32px]">search_off</span>
              </div>
              <p className="text-slate-500 font-medium">Không tìm thấy người dùng nào phù hợp</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 whitespace-nowrap">Người dùng</th>
                  <th className="px-6 py-5 whitespace-nowrap">Liên hệ</th>
                  <th className="px-6 py-5 whitespace-nowrap">Vai trò</th>
                  <th className="px-6 py-5 whitespace-nowrap">Trạng thái</th>
                  <th className="px-8 py-5 whitespace-nowrap text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-50 text-[var(--color-primary)] font-bold flex items-center justify-center shadow-inner border border-blue-100/50">
                          {getInitials(user.fullName)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{user.fullName}</p>
                          <p className="text-xs font-medium text-gray-500 mt-0.5">{user.specialization || 'Nhân viên hệ thống'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-700 flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-gray-400">mail</span> {user.email}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-gray-400">call</span> {user.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getRoleBadge(user.role)} shadow-sm`}>
                        {roleMap[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center w-fit gap-1.5 ${getStatusBadge(user.status)} shadow-sm`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-rose-500'}`}></span>
                        {statusMap[user.status]}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {user.role === 'DOCTOR' && (
                          <button onClick={() => navigate(`/admin/doctor-profile/${user._id}`)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors" title="Xem hồ sơ bác sĩ">
                            <span className="material-symbols-outlined text-[18px]">badge</span>
                          </button>
                        )}
                        <button onClick={() => handleEdit(user)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Chỉnh sửa">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => handleToggleStatus(user)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors" title={user.status === 'ACTIVE' ? 'Tạm khóa' : 'Kích hoạt'}>
                          <span className="material-symbols-outlined text-[18px]">{user.status === 'ACTIVE' ? 'lock' : 'lock_open'}</span>
                        </button>
                        <button onClick={() => handleDelete(user._id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors" title="Xóa tài khoản">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          
          <div className="bg-white rounded-2xl w-full max-w-3xl relative shadow-2xl overflow-hidden animate-[fadeInUp_0.3s_ease-out] flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Chỉnh sửa tài khoản' : 'Thêm mới tài khoản'}</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="addUserForm" onSubmit={handleAddUser} className="space-y-6">
                
                {/* Personal Information */}
                <section className="space-y-4">
                  <h3 className="flex items-center gap-2 text-[15px] font-bold text-[#1e3a8a] mb-2">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                    Thông tin cá nhân & Tài khoản
                  </h3>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Họ và tên <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="VD: Nguyễn Văn A"
                      value={newUser.fullName}
                      onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">Số điện thoại <span className="text-rose-500">*</span></label>
                      <input 
                        type="tel" 
                        required
                        placeholder="VD: 0901234567"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">Email <span className="text-rose-500">*</span></label>
                      <input 
                        type="email" 
                        required
                        placeholder="email@example.com"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {!editingId && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">Mật khẩu <span className="text-rose-500">*</span></label>
                      <input
                        type="password"
                        required
                        minLength="8"
                        pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"
                        title="Ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">Vai trò <span className="text-rose-500">*</span></label>
                      <select 
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer text-slate-700"
                      >
                        {isAdmin && <option value="MANAGER">Quản lý (Manager)</option>}
                        <option value="DOCTOR">Bác sĩ (Doctor)</option>
                        {isAdmin && <option value="ADMIN">Quản trị viên (Admin)</option>}
                        <option value="NURSE">Y tá (Nurse)</option>
                        <option value="RECEPTIONIST">Lễ tân (Receptionist)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">Trạng thái <span className="text-rose-500">*</span></label>
                      <select 
                        value={newUser.status}
                        onChange={(e) => setNewUser({...newUser, status: e.target.value})}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer text-slate-700"
                      >
                        <option value="ACTIVE">Hoạt động (Active)</option>
                        <option value="INACTIVE">Tạm khóa (Inactive)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Chuyên môn (Chỉ dành cho Bác sĩ)</label>
                    <input 
                      type="text" 
                      placeholder="VD: Chỉnh nha, Cấy ghép răng sứ..."
                      value={newUser.specialization}
                      onChange={(e) => setNewUser({...newUser, specialization: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {newUser.role === 'DOCTOR' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">Số chứng chỉ hành nghề <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={newUser.licenseNumber}
                        onChange={(e) => setNewUser({...newUser, licenseNumber: e.target.value})}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  )}
                </section>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit"
                form="addUserForm"
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#1e40af] hover:bg-[#1e3a8a] transition-colors shadow-sm"
              >
                Lưu tài khoản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
