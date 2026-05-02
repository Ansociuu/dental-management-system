import React, { useState } from 'react';

const CustomerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Mock data for customers (patients)
  const [customers] = useState([
    {
      id: 1,
      name: 'Trần Thị Thu Thảo',
      phone: '0901 234 567',
      email: 'thuthao.tran@email.com',
      lastVisit: '2023-10-15',
      totalSpent: '12,500,000 đ',
      status: 'Khách quen',
      avatar: 'T'
    },
    {
      id: 2,
      name: 'Lê Hoàng Minh',
      phone: '0912 345 678',
      email: 'hoangminh99@email.com',
      lastVisit: '2023-11-02',
      totalSpent: '3,200,000 đ',
      status: 'Khách mới',
      avatar: 'M'
    },
    {
      id: 3,
      name: 'Phạm Văn Hùng',
      phone: '0987 654 321',
      email: 'hung.pham@email.com',
      lastVisit: '2023-09-28',
      totalSpent: '45,000,000 đ',
      status: 'VIP',
      avatar: 'H'
    },
    {
      id: 4,
      name: 'Nguyễn Bích Ngọc',
      phone: '0933 445 566',
      email: 'bichngoc.ng@email.com',
      lastVisit: '2023-11-20',
      totalSpent: '8,500,000 đ',
      status: 'Khách quen',
      avatar: 'N'
    },
    {
      id: 5,
      name: 'Đặng Thái Sơn',
      phone: '0977 889 900',
      email: 'son.dang@email.com',
      lastVisit: '2023-11-25',
      totalSpent: '1,500,000 đ',
      status: 'Khách mới',
      avatar: 'S'
    }
  ]);

  const getStatusStyle = (status) => {
    switch(status) {
      case 'VIP': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Khách quen': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Khách mới': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold">Người dùng</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[var(--color-primary)] font-semibold">Khách hàng</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quản lý Khách hàng</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Quản lý thông tin, lịch sử khám và chi tiêu của bệnh nhân.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Xuất dữ liệu
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] transition-all shadow-lg shadow-blue-900/20 hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Thêm khách hàng
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-[1.5rem] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Tìm theo tên, SĐT hoặc Email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {['Tất cả', 'VIP', 'Khách quen', 'Khách mới'].map(status => (
            <button 
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                statusFilter === status 
                  ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200' 
                  : 'text-slate-500 hover:bg-slate-50 border border-transparent'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Data Table */}
      <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[30%]">Khách hàng</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Liên hệ</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Lịch khám gần nhất</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng chi tiêu</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers
                .filter(c => statusFilter === 'Tất cả' || c.status === statusFilter)
                .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm))
                .map((customer) => (
                <tr key={customer.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-50 text-indigo-700 font-bold flex items-center justify-center shadow-inner border border-indigo-100/50 text-lg">
                        {customer.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-[var(--color-primary)] transition-colors cursor-pointer">{customer.name}</p>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">KH-{customer.id.toString().padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">call</span>
                        {customer.phone}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">mail</span>
                        {customer.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <span className="material-symbols-outlined text-[18px] text-slate-400">calendar_today</span>
                      {new Date(customer.lastVisit).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-emerald-600">{customer.totalSpent}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusStyle(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors tooltip-trigger relative" title="Hồ sơ bệnh án">
                        <span className="material-symbols-outlined text-[20px]">medical_information</span>
                      </button>
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Empty State */}
          {customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) && (statusFilter === 'Tất cả' || c.status === statusFilter)).length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">person_off</span>
              <p className="text-sm font-bold">Không tìm thấy khách hàng nào</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <p className="text-xs font-bold text-slate-500">
            Hiển thị <span className="text-slate-900">1</span> đến <span className="text-slate-900">5</span> trong tổng số <span className="text-slate-900">120</span> khách hàng
          </p>
          <div className="flex gap-1">
            <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-white transition-all bg-white disabled:opacity-50">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-lg bg-[var(--color-primary)] text-white text-xs font-bold shadow-md shadow-blue-500/20">1</button>
            <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors">2</button>
            <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors">3</button>
            <button className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white transition-all bg-white">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-extrabold text-slate-800">Thêm Khách Hàng Mới</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Họ và tên <span className="text-rose-500">*</span></label>
                <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="VD: Nguyễn Văn A" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Số điện thoại <span className="text-rose-500">*</span></label>
                  <input type="tel" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="VD: 0912345678" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Ngày sinh</label>
                  <input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Email</label>
                <input type="email" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="VD: nguyenvan.a@email.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Địa chỉ</label>
                <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="Nhập địa chỉ..." />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">Hủy</button>
              <button className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">Lưu thông tin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
