import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { filterMenuByPermission } from '../utils/permissions';

const DoctorLayout = () => {
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: 'dashboard', label: 'Bảng điều khiển', path: '/doctor/dashboard', permission: { module: 'dashboard' } },
    { icon: 'badge', label: 'Hồ sơ bác sĩ', path: '/doctor/profile' },
    { icon: 'person_search', label: 'Hồ sơ bệnh án', path: '/doctor/records', permission: { module: 'records' } },
    { icon: 'calendar_month', label: 'Đăng ký lịch trực', path: '/doctor/duty-schedules', permission: { module: 'doctorDuty' } },
    { icon: 'history', label: 'Lịch sử ca trực', path: '/doctor/duty-history', permission: { module: 'doctorDuty' } },
  ];

  const visibleMenuItems = filterMenuByPermission(menuItems, user);

  return (
    <div className="flex h-screen bg-slate-100 font-body">
      {/* Sidebar Bác sĩ - Tone màu Teal sang trọng chuyên biệt y khoa */}
      <aside className="w-[280px] bg-gradient-to-b from-teal-950 via-slate-900 to-teal-950 text-slate-300 flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.05)] z-10 relative">
        {/* Logo */}
        <div className="p-8 flex items-center gap-4 border-b border-teal-900/30">
          <div className="bg-gradient-to-br from-teal-400 to-emerald-600 text-white p-2.5 rounded-2xl shadow-lg shadow-teal-500/20">
            <span className="material-symbols-outlined text-[24px] block">health_and_safety</span>
          </div>
          <div>
            <h1 className="text-white font-extrabold text-lg leading-tight tracking-tight">Mec Dental</h1>
            <p className="text-xs text-teal-400 font-semibold uppercase tracking-wider">Doctor Portal</p>
          </div>
        </div>

        {/* Doctor Identity Card */}
        {user && (
          <div className="mx-6 my-6 p-4 bg-teal-900/20 border border-teal-500/10 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-900 font-black flex items-center justify-center text-sm shadow-md shadow-teal-500/10">
              {user.fullName.split(' ').pop().substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">BS. {user.fullName}</p>
              <p className="text-[11px] font-bold text-teal-400 mt-0.5 truncate">{user.specialization || 'Nha khoa Tổng quát'}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
          <p className="px-4 text-[10px] font-bold text-teal-500/60 uppercase tracking-widest mb-4">Chuyên môn & Ca khám</p>
          <ul className="space-y-1.5">
            {visibleMenuItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group ${
                      isActive
                        ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/10'
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[22px] transition-transform group-hover:scale-110">
                    {item.icon}
                  </span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="p-6 border-t border-teal-900/30 bg-slate-950/20">
          <ul className="space-y-2">
            <li>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-950/20 hover:shadow-sm transition-all group text-left"
              >
                <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">
                  logout
                </span>
                Đăng xuất Portal
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 overflow-hidden flex flex-col h-full bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
};

export default DoctorLayout;
