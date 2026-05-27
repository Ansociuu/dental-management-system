import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';

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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await registerUser(form);
      setSession(res.token, res.data);
      navigate('/patient/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Không thể đăng ký tài khoản');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[30px]">person_add</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Đăng ký tài khoản bệnh nhân</h1>
          <p className="text-sm text-slate-500 font-medium mt-2">Nếu SĐT đã có hồ sơ, hệ thống sẽ ghép bằng SĐT và ngày sinh.</p>
        </div>

        {error && <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm font-bold text-rose-700">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Họ và tên</label>
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Số điện thoại</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Mật khẩu</label>
            <input
              type="password"
              minLength="6"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Ngày sinh</label>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Giới tính</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Địa chỉ</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2 flex flex-col md:flex-row gap-3 md:items-center md:justify-between mt-3">
            <Link to="/login" className="text-sm font-bold text-blue-700 hover:text-blue-800">Đã có tài khoản? Đăng nhập</Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-bold shadow-sm"
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
