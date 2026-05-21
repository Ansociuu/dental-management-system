import React, { useState, useEffect } from 'react';
import { getHolidays, createHoliday, updateHoliday, updateHolidayStatus } from '../../services/holidayService';

const HolidaySettings = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', holidayType: 'LE', notes: '' });
  const [error, setError] = useState('');

  const holidayTypeLabels = { LE: 'Nghỉ lễ', TOAN_PHONG_KHAM: 'Toàn phòng khám', DAC_BIET: 'Đặc biệt' };
  const holidayTypeColors = { LE: 'bg-rose-100 text-rose-700 border-rose-200', TOAN_PHONG_KHAM: 'bg-amber-100 text-amber-700 border-amber-200', DAC_BIET: 'bg-purple-100 text-purple-700 border-purple-200' };

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await getHolidays();
      setHolidays(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHolidays(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await updateHoliday(editingId, form);
      } else {
        await createHoliday(form);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setForm({ name: '', startDate: '', endDate: '', holidayType: 'LE', notes: '' });
      fetchHolidays();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (h) => {
    setEditingId(h._id);
    setForm({ name: h.name, startDate: h.startDate.slice(0, 10), endDate: h.endDate.slice(0, 10), holidayType: h.holidayType, notes: h.notes || '' });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (h) => {
    try {
      await updateHolidayStatus(h._id, h.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
      fetchHolidays();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold">Cấu hình</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[var(--color-primary)] font-semibold">Ngày nghỉ</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Thiết lập Ngày nghỉ</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Quản lý ngày nghỉ lễ, ngày đóng cửa phòng khám</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ name: '', startDate: '', endDate: '', holidayType: 'LE', notes: '' }); setIsModalOpen(true); }} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] transition-all shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm ngày nghỉ
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">{error}</div>}

      {/* Table */}
      <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Đang tải dữ liệu...</div>
        ) : holidays.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-slate-300 block mb-3">event_busy</span>
            <p className="text-slate-500 font-medium">Chưa có ngày nghỉ nào được thiết lập</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Tên ngày nghỉ</th>
                <th className="px-6 py-5">Thời gian</th>
                <th className="px-6 py-5">Loại</th>
                <th className="px-6 py-5">Trạng thái</th>
                <th className="px-6 py-5">Ghi chú</th>
                <th className="px-8 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {holidays.map((h) => (
                <tr key={h._id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-4 font-bold text-slate-800">{h.name}</td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(h.startDate)} — {formatDate(h.endDate)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${holidayTypeColors[h.holidayType]}`}>{holidayTypeLabels[h.holidayType]}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center w-fit gap-1.5 ${h.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${h.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                      {h.status === 'ACTIVE' ? 'Đang áp dụng' : 'Tạm ngưng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs max-w-[200px] truncate">{h.notes || '—'}</td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(h)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Sửa"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                      <button onClick={() => handleToggleStatus(h)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${h.status === 'ACTIVE' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`} title={h.status === 'ACTIVE' ? 'Tạm ngưng' : 'Kích hoạt'}><span className="material-symbols-outlined text-[18px]">{h.status === 'ACTIVE' ? 'pause_circle' : 'play_circle'}</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-extrabold text-slate-800">{editingId ? 'Chỉnh sửa ngày nghỉ' : 'Thêm ngày nghỉ mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Tên ngày nghỉ <span className="text-rose-500">*</span></label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="VD: Nghỉ Tết Nguyên Đán" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Từ ngày <span className="text-rose-500">*</span></label>
                  <input type="date" required value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Đến ngày <span className="text-rose-500">*</span></label>
                  <input type="date" required value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Loại ngày nghỉ <span className="text-rose-500">*</span></label>
                <select value={form.holidayType} onChange={e => setForm({...form, holidayType: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                  <option value="LE">Nghỉ lễ</option>
                  <option value="TOAN_PHONG_KHAM">Toàn phòng khám</option>
                  <option value="DAC_BIET">Đặc biệt</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Ghi chú</label>
                <textarea rows="2" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none" placeholder="Ghi chú thêm..." />
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

export default HolidaySettings;
