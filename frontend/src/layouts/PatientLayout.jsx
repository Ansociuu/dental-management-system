import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { icon: 'dashboard', label: 'Tổng quan', path: '/patient/dashboard' },
  { icon: 'event_note', label: 'Lịch khám', path: '/patient/appointments' },
  { icon: 'add_circle', label: 'Đặt lịch', path: '/patient/book' },
  { icon: 'clinical_notes', label: 'Hồ sơ của tôi', path: '/patient/records' },
  { icon: 'receipt_long', label: 'Phiếu thu', path: '/patient/invoices' }
];

const PatientLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex h-screen bg-slate-50 font-body">
      <aside className="w-[280px] bg-white border-r border-slate-200/60 flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div className="p-8 flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
            <span className="material-symbols-outlined text-[24px] block">dentistry</span>
          </div>
          <div>
            <h1 className="text-gray-900 font-extrabold text-lg leading-tight tracking-tight">Mec Dental</h1>
            <p className="text-xs text-slate-500 font-medium">Cổng bệnh nhân</p>
          </div>
        </div>

        {user && (
          <div className="mx-6 mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
              {user.fullName?.split(' ').pop()?.substring(0, 2).toUpperCase() || 'BN'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{user.fullName}</p>
              <p className="text-[11px] font-bold text-blue-600 mt-0.5">Bệnh nhân</p>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Chăm sóc cá nhân</p>
          <ul className="space-y-1.5">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[22px] text-slate-400 group-hover:text-blue-700 transition-transform group-hover:scale-110">
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
            onClick={handleLogout}
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

export default PatientLayout;
