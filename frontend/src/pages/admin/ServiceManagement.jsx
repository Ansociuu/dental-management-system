import React, { useState, useEffect } from 'react';
import { getServices, createService, updateService, deleteService } from '../../services/serviceService';
import ConfigChangeHistory from '../../components/ConfigChangeHistory';

const statusMap = {
  'ACTIVE': 'Hoạt động',
  'INACTIVE': 'Tạm khóa'
};

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', duration: 30, status: 'ACTIVE' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      const res = await getServices(params);
      setServices(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    // Clean price
    const cleanPrice = Number(String(form.price).replace(/[^0-9]/g, ''));
    if (isNaN(cleanPrice) || cleanPrice <= 0) {
      setError('Mức giá phải là số hợp lệ lớn hơn 0');
      return;
    }

    try {
      const payload = { ...form, price: cleanPrice, duration: Number(form.duration) };
      if (editingId) {
        await updateService(editingId, payload);
        setSuccess('Cập nhật dịch vụ thành công!');
      } else {
        await createService(payload);
        setSuccess('Thêm dịch vụ mới thành công!');
      }
      setIsAddModalOpen(false);
      setEditingId(null);
      setForm({ name: '', description: '', price: '', duration: 30, status: 'ACTIVE' });
      setHistoryRefreshKey((key) => key + 1);
      fetchServices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (svc) => {
    setEditingId(svc._id);
    setForm({
      name: svc.name,
      description: svc.description || '',
      price: svc.price,
      duration: svc.duration,
      status: svc.status
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return;
    setError(''); setSuccess('');
    try {
      await deleteService(id);
      setSuccess('Xóa dịch vụ thành công!');
      setHistoryRefreshKey((key) => key + 1);
      fetchServices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleStatus = async (svc) => {
    const nextStatus = svc.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateService(svc._id, { status: nextStatus });
      setSuccess(`Đã chuyển trạng thái dịch vụ sang ${statusMap[nextStatus]}!`);
      setHistoryRefreshKey((key) => key + 1);
      fetchServices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatPrice = (p) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold">Cấu hình hệ thống</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[var(--color-primary)] font-semibold">Quản lý Dịch vụ</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quản lý Dịch vụ</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Quản lý danh mục dịch vụ nha khoa, mức giá và thời gian dự kiến.</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setForm({ name: '', description: '', price: '', duration: 30, status: 'ACTIVE' }); setError(''); setIsAddModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm dịch vụ mới
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">{error}</div>}
      {success && <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">{success}</div>}

      {/* Toolbar */}
      <div className="bg-white rounded-[1.5rem] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
          <input 
            type="text" 
            placeholder="Tìm dịch vụ theo tên..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-medium">Đang tải danh sách dịch vụ...</div>
          ) : services.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-medium">Không tìm thấy dịch vụ nào</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tên dịch vụ</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mô tả</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mức giá</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((service) => (
                  <tr key={service._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-[var(--color-primary)] transition-colors">{service.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-[250px] truncate">{service.description || '—'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{service.duration} phút</td>
                    <td className="px-6 py-4 font-extrabold text-[#1e40af]">{formatPrice(service.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md w-max border ${service.status === 'ACTIVE' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-rose-600 bg-rose-50 border-rose-200'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${service.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                        {statusMap[service.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(service)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => handleToggleStatus(service)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title={service.status === 'ACTIVE' ? 'Tạm ẩn' : 'Kích hoạt'}>
                          <span className="material-symbols-outlined text-[20px]">{service.status === 'ACTIVE' ? 'visibility_off' : 'visibility'}</span>
                        </button>
                        <button onClick={() => handleDelete(service._id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Xóa">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Service Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-extrabold text-slate-800">{editingId ? 'Chỉnh sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Tên dịch vụ <span className="text-rose-500">*</span></label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="VD: Bọc răng sứ Cercon" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Mức giá (VNĐ) <span className="text-rose-500">*</span></label>
                  <input type="text" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="VD: 5000000" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Thời gian dự kiến (phút) <span className="text-rose-500">*</span></label>
                  <input type="number" required value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="VD: 60" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Trạng thái <span className="text-rose-500">*</span></label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Tạm khóa</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Mô tả thêm</label>
                <textarea rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none" placeholder="Nhập mô tả chi tiết..."></textarea>
              </div>
              {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100">Hủy</button>
                <button type="submit" className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm">{editingId ? 'Cập nhật' : 'Lưu dịch vụ'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfigChangeHistory resourceType="SERVICE" title="Lịch sử thay đổi dịch vụ" refreshKey={historyRefreshKey} />
    </div>
  );
};

export default ServiceManagement;
