import React, { useState, useEffect } from 'react';
import { getShifts, createShift, updateShift, deleteShift } from '../../services/shiftService';

const ShiftSettings = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', startTime: '', endTime: '' });
  const [error, setError] = useState('');

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const res = await getShifts();
      setShifts(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShifts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form };
      if (editingId) {
        await updateShift(editingId, payload);
      } else {
        await createShift(payload);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setForm({ name: '', startTime: '', endTime: '' });
      fetchShifts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (s) => {
    setEditingId(s._id);
    setForm({ name: s.name, startTime: s.startTime, endTime: s.endTime });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ca làm việc này?')) return;
    setError('');
    try {
      await deleteShift(id);
      fetchShifts();
    } catch (err) {
      setError(err.message || 'Lỗi khi xóa ca làm việc');
    }
  };

  const shiftColors = ['from-blue-500 to-indigo-500', 'from-amber-500 to-orange-500', 'from-violet-500 to-purple-500'];
  const shiftIcons = ['light_mode', 'wb_sunny', 'nights_stay'];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold">Cấu hình</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[var(--color-primary)] font-semibold">Ca làm việc</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Thiết lập Ca làm việc</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Định nghĩa thời gian và số lượng bệnh nhân tối đa cho từng ca</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ name: '', startTime: '', endTime: '' }); setError(''); setIsModalOpen(true); }} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] transition-all shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm ca mới
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">{error}</div>}

      {/* Cards Grid */}
      {loading ? (
        <div className="text-center text-slate-400 font-medium py-12">Đang tải dữ liệu...</div>
      ) : shifts.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-[48px] text-slate-300 block mb-3">schedule</span>
          <p className="text-slate-500 font-medium">Chưa có ca làm việc nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shifts.map((shift, index) => (
            <div key={shift._id} className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden hover:shadow-lg transition-all group">
              {/* Card Header */}
              <div className={`bg-gradient-to-r ${shiftColors[index % 3]} p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-6 translate-x-6"></div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <span className="material-symbols-outlined text-[24px]">{shiftIcons[index % 3]}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold">{shift.name}</h3>
                    <p className="text-sm opacity-90 font-medium">{shift.startTime} — {shift.endTime}</p>
                  </div>
                </div>
              </div>
              {/* Card Body */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${shift.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    {shift.status === 'ACTIVE' ? '✓ Đang hoạt động' : 'Tạm ngưng'}
                  </span>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(shift)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Sửa ca">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button onClick={() => handleDelete(shift._id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors" title="Xóa ca">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-extrabold text-slate-800">{editingId ? 'Chỉnh sửa ca' : 'Thêm ca mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Tên ca <span className="text-rose-500">*</span></label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="VD: Ca Sáng" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Giờ bắt đầu <span className="text-rose-500">*</span></label>
                  <input type="time" required value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Giờ kết thúc <span className="text-rose-500">*</span></label>
                  <input type="time" required value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Hủy</button>
                <button type="submit" className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] transition-colors shadow-sm">{editingId ? 'Cập nhật' : 'Thêm mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftSettings;
