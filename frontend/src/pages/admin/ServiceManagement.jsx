import React, { useState } from 'react';

const ServiceManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const services = [
    { id: 'SVC-001', name: 'Nhổ răng khôn (Mọc lệch)', category: 'Tiểu phẫu', duration: '45 phút', price: '1,500,000 đ', status: 'Hoạt động' },
    { id: 'SVC-002', name: 'Tẩy trắng răng Laser', category: 'Nha khoa thẩm mỹ', duration: '60 phút', price: '2,500,000 đ', status: 'Hoạt động' },
    { id: 'SVC-003', name: 'Niềng răng mắc cài kim loại', category: 'Chỉnh nha', duration: 'Khám định kỳ', price: '30,000,000 đ', status: 'Hoạt động' },
    { id: 'SVC-004', name: 'Cắm ghép Implant (Hàn Quốc)', category: 'Phục hình', duration: '90 phút', price: '15,000,000 đ', status: 'Hoạt động' },
    { id: 'SVC-005', name: 'Lấy cao răng & Đánh bóng', category: 'Nha khoa tổng quát', duration: '30 phút', price: '300,000 đ', status: 'Hoạt động' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quản lý Dịch vụ</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Quản lý danh mục, giá cả và thời gian của các dịch vụ nha khoa.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm dịch vụ mới
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-[1.5rem] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
          <input 
            type="text" 
            placeholder="Tìm dịch vụ theo tên, mã..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none">
            <option>Tất cả danh mục</option>
            <option>Tiểu phẫu</option>
            <option>Nha khoa thẩm mỹ</option>
            <option>Chỉnh nha</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mã DV</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tên dịch vụ</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mức giá</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((service) => (
                <tr key={service.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-slate-400">{service.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 group-hover:text-[var(--color-primary)] transition-colors cursor-pointer">{service.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">{service.category}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{service.duration}</td>
                  <td className="px-6 py-4 font-bold text-[#1e40af]">{service.price}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md w-max border border-emerald-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      {service.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Service Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-extrabold text-slate-800">Thêm Dịch Vụ Mới</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Tên dịch vụ <span className="text-rose-500">*</span></label>
                <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="VD: Bọc răng sứ Cercon" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Danh mục <span className="text-rose-500">*</span></label>
                  <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                    <option>Phục hình</option>
                    <option>Nha khoa tổng quát</option>
                    <option>Chỉnh nha</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Mã DV</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-slate-50" value="SVC-006" readOnly />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Mức giá (VNĐ) <span className="text-rose-500">*</span></label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="VD: 5,000,000" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Thời gian dự kiến</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="VD: 60 phút" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Mô tả thêm</label>
                <textarea rows="3" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none" placeholder="Nhập mô tả chi tiết..."></textarea>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">Hủy</button>
              <button className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">Lưu dịch vụ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
