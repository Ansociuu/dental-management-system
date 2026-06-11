/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import {
  bulkUpdateServicePrices,
  createService,
  createServicePrice,
  deleteService,
  getServicePriceHistory,
  getServices,
  updateService
} from '../../services/serviceService';
import ConfigChangeHistory from '../../components/ConfigChangeHistory';

const statusMap = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Tạm khóa'
};

const priceStatusMap = {
  ACTIVE: { label: 'Đang hiệu lực', className: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  SCHEDULED: { label: 'Sắp áp dụng', className: 'text-blue-700 bg-blue-50 border-blue-200' },
  EXPIRED: { label: 'Hết hiệu lực', className: 'text-slate-600 bg-slate-50 border-slate-200' }
};

const todayInput = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const cleanMoney = (value) => Number(String(value || '').replace(/[^0-9]/g, ''));

const formatPrice = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
}).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('vi-VN');
};

const formatCoefficient = (value) => new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 2
}).format(Number(value) || 0);

const downloadCsv = (filename, headers, rows) => {
  const escapeCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n');
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

const emptyServiceForm = {
  name: '',
  category: 'Tổng quát',
  description: '',
  price: '',
  priceEffectiveFrom: todayInput(),
  duration: 30,
  complexityCoefficient: 0,
  status: 'ACTIVE'
};

const pageSizeOptions = [8, 10, 20, 50];

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [priceForm, setPriceForm] = useState({ price: '', effectiveFrom: todayInput(), note: '' });
  const [bulkForm, setBulkForm] = useState({ percentage: '', effectiveFrom: todayInput(), note: '' });
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const visibleServiceIds = useMemo(() => services.map((service) => service._id), [services]);
  const totalPages = Math.max(1, Math.ceil(services.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = services.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(safeCurrentPage * pageSize, services.length);
  const paginatedServices = useMemo(() => (
    services.slice(pageStart > 0 ? pageStart - 1 : 0, pageEnd)
  ), [services, pageStart, pageEnd]);
  const pageNumbers = useMemo(() => {
    const start = Math.max(1, Math.min(safeCurrentPage - 2, totalPages - 4));
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [safeCurrentPage, totalPages]);

  const resetToFirstPage = () => setCurrentPage(1);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await getServices(params);
      setServices(res.data || []);
      setCategories(res.meta?.categories || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceHistory = async (serviceId) => {
    const res = await getServicePriceHistory(serviceId);
    setPriceHistory(res.data || []);
    return res;
  };

  useEffect(() => {
    fetchServices();
  }, [searchTerm, categoryFilter, statusFilter]);

  const openCreateServiceModal = () => {
    setEditingService(null);
    setServiceForm(emptyServiceForm);
    setError('');
    setServiceModalOpen(true);
  };

  const openEditServiceModal = (service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name || '',
      category: service.category || 'Tổng quát',
      description: service.description || '',
      price: service.price || '',
      priceEffectiveFrom: todayInput(),
      duration: service.duration || 30,
      complexityCoefficient: service.complexityCoefficient ?? 0,
      status: service.status || 'ACTIVE'
    });
    setError('');
    setServiceModalOpen(true);
  };

  const openPriceModal = async (service) => {
    try {
      setSelectedService(service);
      setPriceForm({ price: service.price || '', effectiveFrom: todayInput(), note: '' });
      setPriceHistory([]);
      setPriceModalOpen(true);
      await fetchPriceHistory(service._id);
    } catch (err) {
      setError(err.message || 'Không thể tải lịch sử giá');
    }
  };

  const handleServiceSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const duration = Number(serviceForm.duration);
    if (!Number.isFinite(duration) || duration <= 0) {
      setError('Thời gian thực hiện phải lớn hơn 0 phút');
      return;
    }

    const complexityCoefficient = Number(serviceForm.complexityCoefficient);
    if (!Number.isFinite(complexityCoefficient) || complexityCoefficient < 0 || complexityCoefficient > 0.5) {
      setError('Hệ số độ khó phải nằm trong khoảng 0 đến 0.5');
      return;
    }

    const payload = {
      name: serviceForm.name,
      category: serviceForm.category,
      description: serviceForm.description,
      duration,
      complexityCoefficient,
      status: serviceForm.status
    };

    if (!editingService) {
      const price = cleanMoney(serviceForm.price);
      if (!Number.isFinite(price) || price <= 0) {
        setError('Giá dịch vụ phải lớn hơn 0');
        return;
      }
      payload.price = price;
      payload.priceEffectiveFrom = serviceForm.priceEffectiveFrom;
      payload.note = 'Giá khởi tạo';
    }

    try {
      if (editingService) {
        await updateService(editingService._id, payload);
        setSuccess('Cập nhật dịch vụ thành công');
      } else {
        await createService(payload);
        setSuccess('Thêm dịch vụ mới thành công');
      }

      setServiceModalOpen(false);
      setEditingService(null);
      setServiceForm(emptyServiceForm);
      setHistoryRefreshKey((key) => key + 1);
      await fetchServices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Không thể lưu dịch vụ');
    }
  };

  const handleSavePrice = async (event) => {
    event.preventDefault();
    if (!selectedService) return;

    const price = cleanMoney(priceForm.price);
    if (!Number.isFinite(price) || price <= 0) {
      setError('Giá dịch vụ phải lớn hơn 0');
      return;
    }

    try {
      setError('');
      setSuccess('');
      const res = await createServicePrice(selectedService._id, {
        price,
        effectiveFrom: priceForm.effectiveFrom,
        note: priceForm.note
      });
      if (res.service) setSelectedService(res.service);
      setSuccess('Đã lưu mức giá theo ngày hiệu lực');
      setPriceForm({ price: '', effectiveFrom: todayInput(), note: '' });
      setHistoryRefreshKey((key) => key + 1);
      await Promise.all([fetchServices(), fetchPriceHistory(selectedService._id)]);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Không thể lưu mức giá');
    }
  };

  const handleBulkPriceUpdate = async (event) => {
    event.preventDefault();
    const percentage = Number(bulkForm.percentage);
    if (!Number.isFinite(percentage) || percentage === 0 || percentage <= -100) {
      setError('Tỷ lệ tăng/giảm phải khác 0 và lớn hơn -100%');
      return;
    }
    if (visibleServiceIds.length === 0) {
      setError('Không có dịch vụ trong danh sách đang lọc');
      return;
    }
    if (!confirm(`Áp dụng cập nhật ${percentage > 0 ? '+' : ''}${percentage}% cho ${visibleServiceIds.length} dịch vụ đang lọc?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await bulkUpdateServicePrices({
        serviceIds: visibleServiceIds,
        percentage,
        effectiveFrom: bulkForm.effectiveFrom,
        note: bulkForm.note
      });
      setSuccess('Đã cập nhật giá hàng loạt');
      setBulkForm({ percentage: '', effectiveFrom: todayInput(), note: '' });
      setHistoryRefreshKey((key) => key + 1);
      await fetchServices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Không thể cập nhật giá hàng loạt');
    }
  };

  const handleDelete = async (service) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${service.name}"?`)) return;
    setError('');
    setSuccess('');
    try {
      await deleteService(service._id);
      setSuccess('Xóa dịch vụ thành công');
      setHistoryRefreshKey((key) => key + 1);
      await fetchServices();
    } catch (err) {
      setError(err.message || 'Không thể xóa dịch vụ');
    }
  };

  const handleToggleStatus = async (service) => {
    const nextStatus = service.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      setError('');
      setSuccess('');
      await updateService(service._id, { status: nextStatus });
      setSuccess(`Đã chuyển trạng thái dịch vụ sang ${statusMap[nextStatus]}`);
      setHistoryRefreshKey((key) => key + 1);
      await fetchServices();
    } catch (err) {
      setError(err.message || 'Không thể đổi trạng thái dịch vụ');
    }
  };

  const exportPriceList = () => {
    downloadCsv('bang-gia-dich-vu.csv', [
      'Tên dịch vụ',
      'Nhóm dịch vụ',
      'Thời gian',
      'Hệ số độ khó',
      'Giá hiện hành',
      'Trạng thái'
    ], services.map((service) => [
      service.name,
      service.category || 'Tổng quát',
      `${service.duration || 0} phút`,
      service.complexityCoefficient ?? 0,
      service.price || 0,
      statusMap[service.status] || service.status
    ]));
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 relative">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold">Cấu hình hệ thống</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[var(--color-primary)] font-semibold">Dịch vụ</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Thiết lập giá dịch vụ</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Quản lý danh mục dịch vụ, giá theo ngày hiệu lực và hệ số độ khó dùng cho tính lương.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <button
            type="button"
            onClick={exportPriceList}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Xuất Excel
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            In / PDF
          </button>
          <button
            type="button"
            onClick={openCreateServiceModal}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Thêm dịch vụ
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-bold">{error}</div>}
      {success && <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-bold">{success}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6 print:hidden">
        <div className="xl:col-span-3 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input
                type="text"
                placeholder="Tìm theo tên, mô tả hoặc nhóm..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  resetToFirstPage();
                }}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                resetToFirstPage();
              }}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="">Tất cả nhóm</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                resetToFirstPage();
              }}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Tạm khóa</option>
            </select>
          </div>
        </div>

        <form onSubmit={handleBulkPriceUpdate} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Cập nhật hàng loạt</h2>
              <p className="text-[11px] font-semibold text-slate-400">{services.length} dịch vụ đang lọc</p>
            </div>
            <span className="material-symbols-outlined text-blue-700">percent</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.1"
              value={bulkForm.percentage}
              onChange={(event) => setBulkForm({ ...bulkForm, percentage: event.target.value })}
              placeholder="+/- %"
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500"
            />
            <input
              type="date"
              value={bulkForm.effectiveFrom}
              onChange={(event) => setBulkForm({ ...bulkForm, effectiveFrom: event.target.value })}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500"
            />
          </div>
          <input
            type="text"
            value={bulkForm.note}
            onChange={(event) => setBulkForm({ ...bulkForm, note: event.target.value })}
            placeholder="Ghi chú"
            className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500"
          />
          <button type="submit" className="w-full mt-3 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-extrabold hover:bg-slate-800">
            Áp dụng
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-bold">Đang tải bảng giá dịch vụ...</div>
          ) : services.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-bold">Không tìm thấy dịch vụ nào</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Dịch vụ</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Nhóm</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Thời gian</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Độ khó</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Giá hiện hành</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right print:hidden">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedServices.map((service) => (
                  <tr key={service._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-slate-900">{service.name}</p>
                      <p className="text-xs text-slate-500 font-semibold mt-1 max-w-[280px] truncate">{service.description || 'Chưa có mô tả'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 bg-slate-100">{service.category || 'Tổng quát'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{service.duration} phút</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black text-blue-700 bg-blue-50 border border-blue-100">
                        <span className="material-symbols-outlined text-[15px]">speed</span>
                        HS {formatCoefficient(service.complexityCoefficient)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-[#1e40af]">{formatPrice(service.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${service.status === 'ACTIVE' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-rose-600 bg-rose-50 border-rose-200'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${service.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {statusMap[service.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right print:hidden">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={() => openPriceModal(service)} className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg" title="Thiết lập giá">
                          <span className="material-symbols-outlined text-[20px]">price_change</span>
                        </button>
                        <button type="button" onClick={() => openEditServiceModal(service)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Chỉnh sửa dịch vụ">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button type="button" onClick={() => handleToggleStatus(service)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg" title={service.status === 'ACTIVE' ? 'Tạm khóa' : 'Kích hoạt'}>
                          <span className="material-symbols-outlined text-[20px]">{service.status === 'ACTIVE' ? 'visibility_off' : 'visibility'}</span>
                        </button>
                        <button type="button" onClick={() => handleDelete(service)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg" title="Xóa">
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
        {!loading && services.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="text-sm font-bold text-slate-500">
                Hiển thị <span className="text-slate-900">{pageStart}</span>-<span className="text-slate-900">{pageEnd}</span> trong <span className="text-slate-900">{services.length}</span> dịch vụ
              </p>
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  resetToFirstPage();
                }}
                className="w-fit px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500"
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>{option} dòng/trang</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safeCurrentPage === 1}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:text-blue-700 hover:bg-blue-50 flex items-center justify-center"
                title="Trang trước"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-xl text-sm font-black border transition-colors ${
                    page === safeCurrentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={safeCurrentPage === totalPages}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:text-blue-700 hover:bg-blue-50 flex items-center justify-center"
                title="Trang sau"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfigChangeHistory resourceType="SERVICE_PRICE" title="Lịch sử thiết lập giá dịch vụ" refreshKey={historyRefreshKey} />

      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">{editingService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}</h2>
                <p className="text-xs font-semibold text-slate-400 mt-1">{editingService ? 'Đổi giá ở nút Thiết lập giá để lưu lịch sử hiệu lực.' : 'Giá khởi tạo sẽ tạo mốc lịch sử đầu tiên.'}</p>
              </div>
              <button type="button" onClick={() => setServiceModalOpen(false)} className="text-slate-400 hover:text-rose-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleServiceSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Tên dịch vụ <span className="text-rose-500">*</span></label>
                  <input required type="text" value={serviceForm.name} onChange={(event) => setServiceForm({ ...serviceForm, name: event.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Nhóm dịch vụ <span className="text-rose-500">*</span></label>
                  <input required type="text" list="service-categories" value={serviceForm.category} onChange={(event) => setServiceForm({ ...serviceForm, category: event.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500" />
                  <datalist id="service-categories">
                    {categories.map((category) => <option key={category} value={category} />)}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">{editingService ? 'Giá hiện hành' : 'Giá khởi tạo'} <span className="text-rose-500">*</span></label>
                  <input
                    required={!editingService}
                    disabled={Boolean(editingService)}
                    type="text"
                    value={serviceForm.price}
                    onChange={(event) => setServiceForm({ ...serviceForm, price: event.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Ngày hiệu lực giá</label>
                  <input
                    type="date"
                    disabled={Boolean(editingService)}
                    value={serviceForm.priceEffectiveFrom}
                    onChange={(event) => setServiceForm({ ...serviceForm, priceEffectiveFrom: event.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Thời gian dự kiến <span className="text-rose-500">*</span></label>
                  <input required type="number" min="1" value={serviceForm.duration} onChange={(event) => setServiceForm({ ...serviceForm, duration: event.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Hệ số độ khó dịch vụ <span className="text-rose-500">*</span></label>
                  <input type="number" required min="0" max="0.5" step="0.1" value={serviceForm.complexityCoefficient} onChange={(event) => setServiceForm({ ...serviceForm, complexityCoefficient: event.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500" />
                  <p className="text-[11px] font-semibold text-slate-400">Trường này vẫn là hệ số bệnh nhân mặc định cho UC4.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Trạng thái</label>
                  <select value={serviceForm.status} onChange={(event) => setServiceForm({ ...serviceForm, status: event.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white">
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Tạm khóa</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Mô tả</label>
                <textarea rows="3" value={serviceForm.description} onChange={(event) => setServiceForm({ ...serviceForm, description: event.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 resize-none" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setServiceModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100">Hủy</button>
                <button type="submit" className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm">{editingService ? 'Cập nhật' : 'Lưu dịch vụ'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {priceModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">Thiết lập giá dịch vụ</h2>
                <p className="text-xs font-semibold text-slate-400 mt-1">{selectedService.name} · Giá hiện hành {formatPrice(selectedService.price)}</p>
              </div>
              <button type="button" onClick={() => setPriceModalOpen(false)} className="text-slate-400 hover:text-rose-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
              <form onSubmit={handleSavePrice} className="lg:col-span-2 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Mức giá mới <span className="text-rose-500">*</span></label>
                  <input type="text" required value={priceForm.price} onChange={(event) => setPriceForm({ ...priceForm, price: event.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Ngày hiệu lực <span className="text-rose-500">*</span></label>
                  <input type="date" required value={priceForm.effectiveFrom} onChange={(event) => setPriceForm({ ...priceForm, effectiveFrom: event.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Ghi chú</label>
                  <textarea rows="4" value={priceForm.note} onChange={(event) => setPriceForm({ ...priceForm, note: event.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 resize-none" placeholder="Ví dụ: áp dụng bảng giá tháng mới" />
                </div>
                <button type="submit" className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-extrabold hover:bg-blue-700">
                  Lưu mức giá
                </button>
              </form>

              <div className="lg:col-span-3 border border-slate-100 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <h3 className="text-sm font-extrabold text-slate-800">Lịch sử giá</h3>
                </div>
                <div className="max-h-[360px] overflow-y-auto">
                  {priceHistory.length === 0 ? (
                    <div className="p-8 text-center text-sm font-bold text-slate-400">Chưa có lịch sử giá</div>
                  ) : (
                    <table className="w-full text-left">
                      <thead className="sticky top-0 bg-white border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase">Giá</th>
                          <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase">Từ ngày</th>
                          <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase">Đến ngày</th>
                          <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {priceHistory.map((item) => {
                          const status = priceStatusMap[item.status] || priceStatusMap.EXPIRED;
                          return (
                            <tr key={item._id}>
                              <td className="px-4 py-3 text-sm font-extrabold text-blue-700">{formatPrice(item.price)}</td>
                              <td className="px-4 py-3 text-sm font-bold text-slate-700">{formatDate(item.effectiveFrom)}</td>
                              <td className="px-4 py-3 text-sm font-bold text-slate-500">{formatDate(item.effectiveTo)}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex px-2.5 py-1 rounded-lg border text-[11px] font-black ${status.className}`}>{status.label}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
