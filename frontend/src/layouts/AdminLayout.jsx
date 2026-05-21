import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(
    location.pathname.includes('/admin/users') || 
    location.pathname.includes('/admin/staff') || 
    location.pathname.includes('/admin/customers') ||
    location.pathname.includes('/admin/patients-temp') ||
    location.pathname.includes('/admin/doctor-profile') ? 'Người dùng' : 
    location.pathname.includes('/admin/appointments/') ? 'Lịch hẹn' :
    location.pathname.includes('/admin/reports') ? 'Báo cáo' : 
    location.pathname.includes('/admin/settings') || 
    location.pathname.includes('/admin/shifts') || 
    location.pathname.includes('/admin/holidays') ? 'Cấu hình' : ''
  );

  const menuItems = [
    { icon: 'dashboard', label: 'Tổng quan', path: '/admin/dashboard' },
    { 
      icon: 'calendar_month', 
      label: 'Lịch hẹn', 
      path: '#',
      isExpandable: true,
      subItems: [
        { label: 'Danh sách lịch hẹn', path: '/admin/appointments' },
        { label: 'Đặt lịch mới', path: '/admin/appointments/book' },
        { label: 'Theo dõi & Điều phối', path: '/admin/appointments/monitor' },
        { label: 'Lịch trực Bác sĩ', path: '/admin/appointments/duty-schedules' }
      ]
    },
    { icon: 'person', label: 'Hồ sơ bệnh án', path: '/admin/records' },
    { icon: 'medical_services', label: 'Dịch vụ', path: '/admin/services' },
    { 
      icon: 'manage_accounts', 
      label: 'Người dùng', 
      path: '#', // Handled by onClick
      isExpandable: true,
      subItems: [
        { label: 'Nhân viên', path: '/admin/users' },
        { label: 'Khách hàng', path: '/admin/customers' },
        { label: 'Bệnh nhân tạm thời', path: '/admin/patients-temp' }
      ]
    },
    { icon: 'security', label: 'Phân quyền', path: '/admin/roles' },
    { 
      icon: 'bar_chart', 
      label: 'Báo cáo', 
      path: '#',
      isExpandable: true,
      subItems: [
        { label: 'Doanh thu', path: '/admin/reports/revenue' },
        { label: 'Hiệu suất Bác sĩ', path: '/admin/reports/doctor-performance' },
        { label: 'Bệnh nhân & Dịch vụ', path: '/admin/reports/patients-services' }
      ]
    },
    { 
      icon: 'settings', 
      label: 'Cấu hình', 
      path: '#',
      isExpandable: true,
      subItems: [
        { label: 'Cấu hình chung', path: '/admin/settings' },
        { label: 'Ca làm việc', path: '/admin/shifts' },
        { label: 'Ngày nghỉ lễ', path: '/admin/holidays' }
      ]
    },
  ];

  const roleMap = {
    'ADMIN': 'Quản trị',
    'DOCTOR': 'Bác sĩ',
    'NURSE': 'Y tá',
    'RECEPTIONIST': 'Lễ tân'
  };

  return (
    <div className="flex h-screen bg-slate-50 font-body">
      {/* Sidebar */}
      <aside className="w-[280px] bg-white border-r border-slate-200/60 flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 relative">
        {/* Logo */}
        <div className="p-8 flex items-center gap-4">
          <div className="bg-gradient-to-br from-[var(--color-primary)] to-blue-600 text-white p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
            <span className="material-symbols-outlined text-[24px] block">medical_information</span>
          </div>
          <div>
            <h1 className="text-gray-900 font-extrabold text-lg leading-tight tracking-tight">Mec</h1>
            <p className="text-xs text-slate-500 font-medium">Hệ thống quản lý</p>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="mx-6 mb-6 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
              {user.fullName.split(' ').pop().substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{user.fullName}</p>
              <p className="text-[11px] font-bold text-blue-600 mt-0.5">{roleMap[user.role] || user.role}</p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="px-6 pb-6">
          <Link to="/admin/appointments/book" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-xl shadow-slate-900/10 transition-all hover:-translate-y-0.5">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Hẹn lịch mới
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Danh mục chính</p>
          <ul className="space-y-1.5">
            {menuItems.map((item, index) => (
              <li key={index}>
                {item.isExpandable ? (
                  <div>
                    <button
                      onClick={() => setOpenMenu(openMenu === item.label ? '' : item.label)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group ${
                        openMenu === item.label
                          ? 'bg-blue-50 text-[var(--color-primary)]' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className={`material-symbols-outlined text-[22px] transition-transform group-hover:scale-110 ${
                          openMenu === item.label ? 'text-[var(--color-primary)]' : 'text-slate-400 group-hover:text-[var(--color-primary)]'
                        }`}>
                          {item.icon}
                        </span>
                        {item.label}
                      </div>
                      <span className={`material-symbols-outlined text-[20px] transition-transform ${openMenu === item.label ? 'rotate-180 text-[var(--color-primary)]' : 'text-slate-400'}`}>
                        expand_more
                      </span>
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openMenu === item.label ? 'max-h-60 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                      <ul className="pl-12 pr-4 space-y-1 py-1">
                        {item.subItems.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <NavLink
                              to={subItem.path}
                              className={({ isActive }) => 
                                `block px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                  isActive || (subItem.path === '/admin/users' && location.pathname.includes('doctor-profile')) || (subItem.path === '/admin/reports/revenue' && location.pathname === '/admin/reports')
                                    ? 'bg-blue-50 text-[var(--color-primary)] shadow-sm' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                }`
                              }
                            >
                              {subItem.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group ${isActive || (item.path === '/admin/records' && window.location.pathname === '/admin')
                        ? 'bg-blue-50 text-[var(--color-primary)] shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    <span className={`material-symbols-outlined text-[22px] transition-transform group-hover:scale-110 ${(window.location.pathname === item.path || (item.path === '/admin/records' && window.location.pathname === '/admin')) ? 'text-[var(--color-primary)]' : 'text-slate-400'}`}>{item.icon}</span>
                    {item.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 mt-auto">
          <ul className="space-y-2">
            <li>
              <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all group">
                <span className="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform">help</span>
                Trợ giúp
              </a>
            </li>
            <li>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 hover:shadow-sm transition-all group text-left"
              >
                <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">logout</span>
                Đăng xuất
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col h-full bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
