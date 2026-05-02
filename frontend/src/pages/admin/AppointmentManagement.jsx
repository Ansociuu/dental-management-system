import React, { useState } from 'react';

const AppointmentManagement = () => {
  const [currentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const appointments = [
    {
      id: 'APT-1029',
      time: '08:30',
      patientName: 'Trần Thị Thu Thảo',
      phone: '0901 234 567',
      service: 'Tẩy trắng răng',
      doctor: 'Dr. Nguyễn Văn A',
      status: 'Đang khám',
      type: 'Khách quen',
      isNew: false
    },
    {
      id: 'APT-1030',
      time: '09:00',
      patientName: 'Lê Hoàng Minh',
      phone: '0912 345 678',
      service: 'Nhổ răng khôn',
      doctor: 'Dr. Lê Minh Tâm',
      status: 'Chờ khám',
      type: 'Khách mới',
      isNew: true
    },
    {
      id: 'APT-1031',
      time: '10:15',
      patientName: 'Phạm Văn Hùng',
      phone: '0987 654 321',
      service: 'Niềng răng (Tái khám)',
      doctor: 'Dr. Nguyễn Văn A',
      status: 'Chờ khám',
      type: 'VIP',
      isNew: false
    },
    {
      id: 'APT-1032',
      time: '13:30',
      patientName: 'Đặng Thái Sơn',
      phone: '0977 889 900',
      service: 'Khám tổng quát',
      doctor: 'Dr. Hoàng Văn E',
      status: 'Đã hủy',
      type: 'Khách mới',
      isNew: true
    },
    {
      id: 'APT-1033',
      time: '15:00',
      patientName: 'Nguyễn Bích Ngọc',
      phone: '0933 445 566',
      service: 'Bọc răng sứ',
      doctor: 'Dr. Lê Minh Tâm',
      status: 'Đã hoàn thành',
      type: 'Khách quen',
      isNew: false
    }
  ];

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Đang khám':
        return { color: 'text-blue-700', bg: 'bg-blue-100', icon: 'stethoscope', border: 'border-blue-200' };
      case 'Chờ khám':
        return { color: 'text-amber-700', bg: 'bg-amber-100', icon: 'pending_actions', border: 'border-amber-200' };
      case 'Đã hoàn thành':
        return { color: 'text-emerald-700', bg: 'bg-emerald-100', icon: 'check_circle', border: 'border-emerald-200' };
      case 'Đã hủy':
        return { color: 'text-rose-700', bg: 'bg-rose-100', icon: 'cancel', border: 'border-rose-200' };
      default:
        return { color: 'text-slate-700', bg: 'bg-slate-100', icon: 'info', border: 'border-slate-200' };
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold">Hệ thống</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[var(--color-primary)] font-semibold">Quản lý Lịch hẹn</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Lịch hẹn trong ngày</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Hôm nay, {currentDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
            <button className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-100 text-slate-800 transition-all">Hôm nay</button>
            <button className="px-4 py-2 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-800 transition-all">Tuần này</button>
            <button className="px-4 py-2 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-800 transition-all">Tháng</button>
          </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tạo lịch hẹn
            </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Tổng lịch hẹn', value: '24', icon: 'event', color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+3 so với hôm qua' },
          { label: 'Chờ khám', value: '12', icon: 'pending_actions', color: 'text-amber-600', bg: 'bg-amber-50', trend: '4 lịch sắp tới' },
          { label: 'Đã hoàn thành', value: '10', icon: 'check_circle', color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Hiệu suất 90%' },
          { label: 'Hủy/Vắng', value: '2', icon: 'event_busy', color: 'text-rose-600', bg: 'bg-rose-50', trend: 'Tỷ lệ thấp' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <span className="material-symbols-outlined text-[24px]">{stat.icon}</span>
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-800 mb-1">{stat.value}</p>
            <p className="text-sm font-bold text-slate-500 mb-2">{stat.label}</p>
            <p className="text-xs text-slate-400 font-medium">{stat.trend}</p>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

        {/* Date Selector / Mini Calendar */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800">Tháng 11, 2023</h3>
              <div className="flex gap-1">
                <button className="p-1 rounded text-slate-400 hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
                <button className="p-1 rounded text-slate-400 hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
              </div>
            </div>
            {/* Simple Mock Calendar */}
            <div className="grid grid-cols-7 gap-y-4 text-center text-xs font-bold mb-4">
              <div className="text-slate-400">T2</div><div className="text-slate-400">T3</div><div className="text-slate-400">T4</div><div className="text-slate-400">T5</div><div className="text-slate-400">T6</div><div className="text-slate-400">T7</div><div className="text-rose-400">CN</div>

              {/* Padding */}
              <div className="text-slate-300 py-1">30</div><div className="text-slate-300 py-1">31</div>

              {/* Days */}
              {[...Array(24)].map((_, i) => (
                <div key={i} className={`py-1 cursor-pointer transition-all ${i + 1 === 20 ? 'bg-[#1e40af] text-white rounded-lg shadow-md' : 'text-slate-700 hover:bg-slate-100 rounded-lg'}`}>
                  {i + 1}
                  {(i === 19 || i === 21) && <div className={`w-1 h-1 rounded-full mx-auto mt-0.5 ${i + 1 === 20 ? 'bg-white' : 'bg-rose-500'}`}></div>}
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Filter */}
          <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Lọc theo Bác sĩ</h3>
            <div className="space-y-3">
              {[
                { name: 'Tất cả bác sĩ', count: 24, active: true },
                { name: 'Dr. Nguyễn Văn A', count: 8, active: false },
                { name: 'Dr. Lê Minh Tâm', count: 10, active: false },
                { name: 'Dr. Hoàng Văn E', count: 6, active: false }
              ].map((doc, i) => (
                <label key={i} className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={doc.active} readOnly className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                    <span className={`text-sm font-medium ${doc.active ? 'text-slate-900 font-bold' : 'text-slate-600 group-hover:text-slate-900'}`}>{doc.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">{doc.count}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Appointment Timeline List */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 h-full overflow-hidden flex flex-col">

            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex gap-6">
                <button
                  className={`text-sm font-bold transition-colors relative ${activeTab === 'upcoming' ? 'text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}
                  onClick={() => setActiveTab('upcoming')}
                >
                  Sắp diễn ra
                  {activeTab === 'upcoming' && <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>}
                </button>
                <button
                  className={`text-sm font-bold transition-colors relative ${activeTab === 'all' ? 'text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}
                  onClick={() => setActiveTab('all')}
                >
                  Tất cả trong ngày
                  {activeTab === 'all' && <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>}
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input type="text" placeholder="Tìm theo tên KH, SĐT..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-64 shadow-sm" />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-2">
                {appointments.map((apt, index) => {
                  const statusInfo = getStatusConfig(apt.status);
                  return (
                    <div key={index} className="flex gap-4 p-4 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50/80 hover:shadow-sm transition-all group">
                      {/* Time Column */}
                      <div className="w-20 shrink-0 text-center flex flex-col items-center pt-1">
                        <span className="text-lg font-extrabold text-slate-800">{apt.time}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Dự kiến</span>
                      </div>

                      {/* Main Card */}
                      <div className={`flex-1 bg-white border ${statusInfo.border} rounded-xl p-4 flex flex-col md:flex-row gap-4 shadow-sm relative overflow-hidden transition-all group-hover:shadow-md`}>
                        {/* Status Indicator Line */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusInfo.bg.replace('100', '500')}`}></div>

                        <div className="flex-1 pl-2">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-base font-bold text-slate-900">{apt.patientName}</h4>
                                {apt.isNew && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Mới</span>
                                )}
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">{apt.type}</span>
                              </div>
                              <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[14px]">call</span>
                                {apt.phone} • {apt.id}
                              </p>
                            </div>
                            <div className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                              <span className="material-symbols-outlined text-[16px]">{statusInfo.icon}</span>
                              {apt.status}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-1.5 text-sm">
                              <span className="material-symbols-outlined text-[16px] text-blue-500">dentistry</span>
                              <span className="font-bold text-slate-700">{apt.service}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm">
                              <span className="material-symbols-outlined text-[16px] text-slate-400">medical_information</span>
                              <span className="font-medium text-slate-600">{apt.doctor}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex md:flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                          <button className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors tooltip-trigger relative" title="Hồ sơ bệnh án">
                            <span className="material-symbols-outlined text-[20px]">assignment_ind</span>
                          </button>
                          <button className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors tooltip-trigger relative" title="Chỉnh sửa">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors tooltip-trigger relative" title="Check-in">
                            <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Add Appointment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-extrabold text-slate-800">Tạo Lịch Hẹn Mới</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Bệnh nhân <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                  <input type="text" className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="Tìm tên hoặc SĐT khách hàng..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Ngày khám <span className="text-rose-500">*</span></label>
                  <input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Giờ khám <span className="text-rose-500">*</span></label>
                  <input type="time" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Bác sĩ phụ trách <span className="text-rose-500">*</span></label>
                <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                  <option>Dr. Nguyễn Văn A</option>
                  <option>Dr. Trần Thị B</option>
                  <option>Dr. Lê Minh C</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Dịch vụ đăng ký <span className="text-rose-500">*</span></label>
                <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                  <option>Khám tổng quát</option>
                  <option>Nhổ răng khôn</option>
                  <option>Tẩy trắng răng</option>
                  <option>Niềng răng</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Ghi chú</label>
                <textarea rows="2" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none" placeholder="Nhập ghi chú cho bác sĩ..."></textarea>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">Hủy</button>
              <button className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">Lưu lịch hẹn</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;
