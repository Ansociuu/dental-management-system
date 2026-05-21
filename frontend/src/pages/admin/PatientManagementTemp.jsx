import React, { useState, useEffect } from 'react';
import { getPatients, createPatient, updatePatient, deletePatient } from '../../services/patientService';

const PatientManagementTemp = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ fullName: '', phone: '', dob: '', gender: 'Nam', address: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await getPatients(searchTerm);
      setPatients(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      if (editingId) {
        await updatePatient(editingId, form);
        setSuccess('Cập nhật hồ sơ bệnh nhân thành công!');
      } else {
        await createPatient(form);
        setSuccess('Thêm hồ sơ bệnh nhân thành công!');
      }
      setIsModalOpen(false);
      setEditingId(null);
      setForm({ fullName: '', phone: '', dob: '', gender: 'Nam', address: '' });
      fetchPatients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setForm({
      fullName: p.fullName,
      phone: p.phone,
      dob: p.dob ? p.dob.slice(0, 10) : '',
      gender: p.gender,
      address: p.address || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hồ sơ bệnh nhân này?')) return;
    setError(''); setSuccess('');
    try {
      await deletePatient(id);
      setSuccess('Xóa hồ sơ bệnh nhân thành công!');
      fetchPatients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold">Hệ thống</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[var(--color-primary)] font-semibold">Hồ sơ bệnh nhân tạm</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quản lý bệnh nhân tạm thời</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Lưu trữ thông tin liên hệ phục vụ cho đặt lịch khám</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ fullName: '', phone: '', dob: '', gender: 'Nam', address: '' }); setError(''); setIsModalOpen(true); }} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] transition-all shadow-sm">
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Thêm bệnh nhân
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">{error}</div>}
      {success && <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">{success}</div>}

      {/* Main Container */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {/* Search bar */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input type="text" placeholder="Tìm theo tên, SĐT hoặc mã bệnh nhân..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-medium">Đang tải danh sách...</div>
          ) : patients.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-slate-300 block mb-3">person_search</span>
              <p className="text-slate-500 font-medium">Không tìm thấy bệnh nhân nào</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5">Mã bệnh nhân</th>
                  <th className="px-6 py-5">Họ và tên</th>
                  <th className="px-6 py-5">Số điện thoại</th>
                  <th className="px-6 py-5">Ngày sinh</th>
                  <th className="px-6 py-5">Giới tính</th>
                  <th className="px-6 py-5">Địa chỉ</th>
                  <th className="px-8 py-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((p) => (
                  <tr key={p._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-4 font-bold text-blue-700">{p.patientCode}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{p.fullName}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{p.phone}</td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(p.dob)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${p.gender === 'Nam' ? 'bg-blue-50 text-blue-700 border-blue-200' : p.gender === 'Nữ' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{p.gender}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs max-w-[200px] truncate">{p.address || '—'}</td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(p)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Chỉnh sửa"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                        <button onClick={() => handleDelete(p._id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors" title="Xóa"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-extrabold text-slate-800">{editingId ? 'Chỉnh sửa hồ sơ bệnh nhân' : 'Thêm hồ sơ bệnh nhân mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Họ và tên <span className="text-rose-500">*</span></label>
                <input type="text" required value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="VD: Nguyễn Văn A" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Số điện thoại <span className="text-rose-500">*</span></label>
                  <input type="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="VD: 0912345678" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Ngày sinh <span className="text-rose-500">*</span></label>
                  <input type="date" required value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Giới tính <span className="text-rose-500">*</span></label>
                <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Địa chỉ</label>
                <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="VD: Hà Nội" />
              </div>
              {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100">Hủy</button>
                <button type="submit" className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] shadow-sm">{editingId ? 'Cập nhật' : 'Thêm mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagementTemp;
