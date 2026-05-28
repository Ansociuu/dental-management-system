import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ thông tin đăng nhập.');
      return;
    }

    try {
      setLoading(true);
      const user = await login({ email, password });
      
      toast.success('Đăng nhập thành công!');
      
      // Chuyển hướng người dùng dựa trên vai trò hoặc mặc định về dashboard tương ứng
      if (user.role === 'DOCTOR') {
        navigate('/doctor');
      } else if (user.role === 'PATIENT') {
        navigate('/patient');
      } else if (user.role === 'ADMIN' || user.role === 'MANAGER' || user.role === 'RECEPTIONIST') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] p-4 relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-primary)] rounded-full mix-blend-multiply filter blur-[120px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-tertiary)] rounded-full mix-blend-multiply filter blur-[120px] opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 md:p-10 shadow-[0_4px_30px_rgba(0,80,203,0.08)] relative">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 animate-[float_6s_ease-in-out_infinite]">
            <span className="material-symbols-outlined text-[36px]">dentistry</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Hệ Thống Nha Khoa MEC</h1>
          <p className="text-sm text-[var(--color-on-surface-variant)] font-medium mt-2">Đăng nhập để quản lý lịch khám & bệnh nhân</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider pl-1">Email hệ thống</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">mail</span>
              <input
                type="email"
                placeholder="VD: admin@mec.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent placeholder:text-gray-400 transition-all shadow-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center pl-1">
              <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Mật khẩu</label>
              <a href="#" className="text-xs font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-container)] transition-colors">Quên mật khẩu?</a>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">lock</span>
              <input
                type="password"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent placeholder:text-gray-400 transition-all shadow-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              <span>Đăng Nhập</span>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link to="/register" className="block text-sm font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-container)] transition-colors mb-3">
            Đăng ký
          </Link>
          <p className="text-xs text-[var(--color-on-surface-variant)] font-semibold">
            Tài khoản dùng thử mặc định: <span className="text-gray-900">admin@mec.vn</span> / <span className="text-gray-900">123456</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
