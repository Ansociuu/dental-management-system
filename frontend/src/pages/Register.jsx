import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    dob: '',
    gender: 'Nam',
    address: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const res = await registerUser(form);
      setSession(res.token, res.data);
      toast.success('Đăng ký tài khoản thành công!');
      navigate('/patient/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Không thể đăng ký tài khoản');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] p-4 relative overflow-hidden py-12">
      {/* Decorative Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-primary)] rounded-full mix-blend-multiply filter blur-[120px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-tertiary)] rounded-full mix-blend-multiply filter blur-[120px] opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 md:p-10 shadow-[0_4px_30px_rgba(0,80,203,0.08)] relative">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 animate-[float_6s_ease-in-out_infinite]">
            <span className="material-symbols-outlined text-[36px]">person_add</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Đăng ký tài khoản</h1>
          <p className="text-sm text-[var(--color-on-surface-variant)] font-medium mt-2">Nếu SĐT đã có hồ sơ, hệ thống sẽ tự động liên kết.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider pl-1">Họ và tên</label>
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="mt-1 w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent placeholder:text-gray-400 transition-all shadow-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider pl-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent placeholder:text-gray-400 transition-all shadow-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider pl-1">Số điện thoại</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent placeholder:text-gray-400 transition-all shadow-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider pl-1">Mật khẩu</label>
            <input
              type="password"
              minLength="6"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent placeholder:text-gray-400 transition-all shadow-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider pl-1">Ngày sinh</label>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              className="mt-1 w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent placeholder:text-gray-400 transition-all shadow-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider pl-1">Giới tính</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="mt-1 w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent placeholder:text-gray-400 transition-all shadow-sm"
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider pl-1">Địa chỉ</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="mt-1 w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent placeholder:text-gray-400 transition-all shadow-sm"
            />
          </div>
          <div className="md:col-span-2 flex flex-col md:flex-row gap-4 md:items-center md:justify-between mt-6">
            <Link to="/login" className="text-sm font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-container)] transition-colors">Đã có tài khoản? Đăng nhập</Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-3.5 px-8 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none w-full md:w-auto"
            >
              {loading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
