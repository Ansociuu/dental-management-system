import React, { useState } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Nguyễn Văn A', email: 'nva@mec.vn', role: 'Bác sĩ', status: 'Hoạt động', avatar: 'NA', phone: '0901234567' },
    { id: 2, name: 'Trần Thị B', email: 'ttb@mec.vn', role: 'Lễ tân', status: 'Hoạt động', avatar: 'TB', phone: '0912345678' },
    { id: 3, name: 'Lê Văn C', email: 'lvc@mec.vn', role: 'Quản trị viên', status: 'Hoạt động', avatar: 'LC', phone: '0923456789' },
    { id: 4, name: 'Phạm Thị D', email: 'ptd@mec.vn', role: 'Y tá', status: 'Tạm khóa', avatar: 'PD', phone: '0934567890' },
    { id: 5, name: 'Hoàng Văn E', email: 'hve@mec.vn', role: 'Bác sĩ', status: 'Hoạt động', avatar: 'HE', phone: '0945678901' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', role: 'Bác sĩ', status: 'Hoạt động' });

  const getRoleBadge = (role) => {
    switch(role) {
      case 'Quản trị viên': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Bác sĩ': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Y tá': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Lễ tân': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Hoạt động') return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-rose-100 text-rose-700 border-rose-200';
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    // Generate avatar initials
    const initials = newUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const userToAdd = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      ...newUser,
      avatar: initials
    };

    setUsers([userToAdd, ...users]);
    setNewUser({ name: '', email: '', phone: '', role: 'Bác sĩ', status: 'Hoạt động' });
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 relative">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold">Cấu hình hệ thống</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-gray-900 font-semibold">Quản lý người dùng</span>
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
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white px-7 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Thêm người dùng
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <select className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 font-semibold text-sm outline-none focus:border-blue-500 cursor-pointer">
              <option value="">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="doctor">Bác sĩ</option>
              <option value="nurse">Y tá</option>
              <option value="receptionist">Lễ tân</option>
            </select>
            <button className="flex items-center justify-center bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-4 py-3 rounded-xl transition-colors">
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
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
              {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-50 text-[var(--color-primary)] font-bold flex items-center justify-center shadow-inner border border-blue-100/50">
                        {user.avatar}
                      </div>
                      <div>
                        {user.role === 'Bác sĩ' ? (
                          <a href="/admin/doctor-profile" className="font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors cursor-pointer hover:underline">
                            {user.name}
                          </a>
                        ) : (
                          <p className="font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{user.name}</p>
                        )}
                        <p className="text-xs font-medium text-gray-500 mt-0.5">ID: MEC-USR-{user.id.toString().padStart(3, '0')}</p>
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
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center w-fit gap-1.5 ${getStatusBadge(user.status)} shadow-sm`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Hoạt động' ? 'bg-green-500 animate-pulse' : 'bg-rose-500'}`}></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Chỉnh sửa">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors" title="Đổi mật khẩu">
                        <span className="material-symbols-outlined text-[18px]">key</span>
                      </button>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors" title="Khóa tài khoản">
                        <span className="material-symbols-outlined text-[18px]">lock</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <span className="material-symbols-outlined text-[32px]">search_off</span>
              </div>
              <p className="text-slate-500 font-medium">Không tìm thấy người dùng nào phù hợp</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-gray-100 bg-slate-50/50 flex justify-between items-center">
          <p className="text-sm font-medium text-slate-500">Hiển thị <span className="font-bold text-slate-900">1</span> đến <span className="font-bold text-slate-900">{users.length}</span> trong <span className="font-bold text-slate-900">{users.length}</span> người dùng</p>
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-400 cursor-not-allowed">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--color-primary)] text-white font-bold shadow-md shadow-blue-500/20">
              1
            </button>
            <button className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>

      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          
          <div className="bg-white rounded-2xl w-full max-w-3xl relative shadow-2xl overflow-hidden animate-[fadeInUp_0.3s_ease-out] flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-xl font-bold text-slate-800">Thêm mới tài khoản</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="addUserForm" onSubmit={handleAddUser} className="space-y-8">
                
                {/* 1. Login Information */}
                <section>
                  <h3 className="flex items-center gap-2 text-[15px] font-bold text-[#1e3a8a] mb-4">
                    <span className="material-symbols-outlined text-[20px]">key</span>
                    Thông tin đăng nhập
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">Username</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="VD: dr_nguyen"
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 text-[18px]">check_circle</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">Mật khẩu</label>
                      <div className="relative">
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 italic mt-1">Mật khẩu phải bao gồm ít nhất 8 ký tự, bao gồm cả chữ và số.</p>
                    </div>
                  </div>
                </section>

                {/* 2. Personal Information */}
                <section>
                  <h3 className="flex items-center gap-2 text-[15px] font-bold text-[#1e3a8a] mb-4">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                    Thông tin cá nhân
                  </h3>
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">Họ và tên</label>
                      <input 
                        type="text" 
                        required
                        placeholder="VD: Nguyễn Văn A"
                        value={newUser.name}
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600">Số điện thoại</label>
                        <input 
                          type="tel" 
                          placeholder="0901 234 567"
                          value={newUser.phone}
                          onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600">Email</label>
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
                  </div>
                </section>

                {/* 3. Permissions */}
                <section>
                  <h3 className="flex items-center gap-2 text-[15px] font-bold text-[#1e3a8a] mb-4">
                    <span className="material-symbols-outlined text-[20px]">shield</span>
                    Phân quyền
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">Chọn Vai trò</label>
                      <div className="relative">
                        <select 
                          value={newUser.role}
                          onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer text-slate-700"
                        >
                          <option value="Bác sĩ">Bác sĩ (Practitioner)</option>
                          <option value="Quản trị viên">Quản trị viên (Admin)</option>
                          <option value="Y tá">Y tá (Nurse)</option>
                          <option value="Lễ tân">Lễ tân (Receptionist)</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">expand_more</span>
                      </div>
                    </div>

                    {/* Permissions Preview Table */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30">
                      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500">
                        Quyền hạn của vai trò
                      </div>
                      <div className="divide-y divide-slate-100">
                        <div className="px-4 py-3 flex justify-between items-center bg-white">
                          <span className="text-sm text-slate-600">Xem hồ sơ bệnh nhân</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded text-emerald-600 bg-emerald-50 tracking-wider">CÓ QUYỀN</span>
                        </div>
                        <div className="px-4 py-3 flex justify-between items-center bg-white">
                          <span className="text-sm text-slate-600">Tạo lịch hẹn mới</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded text-emerald-600 bg-emerald-50 tracking-wider">CÓ QUYỀN</span>
                        </div>
                        <div className="px-4 py-3 flex justify-between items-center bg-white">
                          <span className="text-sm text-slate-600">Xóa dữ liệu hệ thống</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded text-slate-500 bg-slate-100 tracking-wider">KHÔNG</span>
                        </div>
                        <div className="px-4 py-3 flex justify-between items-center bg-white">
                          <span className="text-sm text-slate-600">Quản lý hóa đơn & thanh toán</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded text-slate-500 bg-slate-100 tracking-wider">KHÔNG</span>
                        </div>
                      </div>
                    </div>
                  </div>
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
