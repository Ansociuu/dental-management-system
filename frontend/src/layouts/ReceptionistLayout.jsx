import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ReceptionistLayout = () => {
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: 'dashboard', label: 'Tổng quan', path: '/receptionist/dashboard' },
    { icon: 'event_available', label: 'Đặt lịch', path: '/receptionist/appointments/book' },
    { icon: 'monitor_heart', label: 'Theo dõi lịch khám', path: '/receptionist/appointments/monitor' },
    { icon: 'support_agent', label: 'Gọi lại sau khám', path: '/receptionist/follow-ups' },
    { icon: 'groups', label: 'Bệnh nhân', path: '/receptionist/patients' },
    { icon: 'clinical_notes', label: 'Lịch trực bác sĩ', path: '/receptionist/duty-schedules' }
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-body">
      <aside className="w-[280px] bg-white border-r border-slate-200/60 flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div className="p-8 flex items-center gap-4">
          <div className="bg-gradient-to-br from-[var(--color-primary)] to-blue-600 text-white p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
            <span className="material-symbols-outlined text-[24px] block">medical_information</span>
          </div>
          <div>
            <h1 className="text-gray-900 font-extrabold text-lg leading-tight tracking-tight">Mec</h1>
            <p className="text-xs text-slate-500 font-medium">Phân hệ lễ tân</p>
          </div>
        </div>

        {user && (
          <div className="mx-6 mb-6 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
              {user.fullName?.split(' ').pop()?.substring(0, 2).toUpperCase() || 'LT'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{user.fullName}</p>
              <p className="text-[11px] font-bold text-blue-600 mt-0.5">Lễ tân</p>
            </div>
          </div>
        )}

        <div className="px-6 pb-6">
          <Link to="/receptionist/appointments/book" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-xl shadow-slate-900/10 transition-all hover:-translate-y-0.5">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Hẹn lịch mới
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Tiếp nhận</p>
          <ul className="space-y-1.5">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group ${
                      isActive
                        ? 'bg-blue-50 text-[var(--color-primary)] shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[22px] text-slate-400 group-hover:text-[var(--color-primary)] transition-transform group-hover:scale-110">
                    {item.icon}
                  </span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 mt-auto">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 hover:shadow-sm transition-all group text-left"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">logout</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden flex flex-col h-full bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
};

export default ReceptionistLayout;
