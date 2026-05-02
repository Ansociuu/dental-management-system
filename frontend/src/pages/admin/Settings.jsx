import React, { useState } from 'react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Cấu hình Hệ thống</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Quản lý thông tin phòng khám, cài đặt email và các tham số vận hành.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Settings Navigation Sidebar */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
            <ul className="flex flex-col">
              <li>
                <button 
                  onClick={() => setActiveTab('general')}
                  className={`w-full text-left px-6 py-4 font-bold text-sm flex items-center gap-3 transition-colors ${activeTab === 'general' ? 'bg-blue-50/50 border-l-4 border-[#1e40af] text-[#1e40af]' : 'border-l-4 border-transparent text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">domain</span>
                  Thông tin phòng khám
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full text-left px-6 py-4 font-bold text-sm flex items-center gap-3 transition-colors ${activeTab === 'notifications' ? 'bg-blue-50/50 border-l-4 border-[#1e40af] text-[#1e40af]' : 'border-l-4 border-transparent text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                  Thông báo & Nhắc hẹn
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('billing')}
                  className={`w-full text-left px-6 py-4 font-bold text-sm flex items-center gap-3 transition-colors ${activeTab === 'billing' ? 'bg-blue-50/50 border-l-4 border-[#1e40af] text-[#1e40af]' : 'border-l-4 border-transparent text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                  Cấu hình Hóa đơn
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('backup')}
                  className={`w-full text-left px-6 py-4 font-bold text-sm flex items-center gap-3 transition-colors ${activeTab === 'backup' ? 'bg-blue-50/50 border-l-4 border-[#1e40af] text-[#1e40af]' : 'border-l-4 border-transparent text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">backup</span>
                  Sao lưu dữ liệu
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Settings Form Content */}
        <div className="xl:col-span-3 space-y-6">
          {activeTab === 'general' && (
            <>
              <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-8">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  Thông tin chung
                </h2>

                <div className="space-y-6">
                  <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined text-[32px]">add_photo_alternate</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Logo phòng khám</h3>
                      <p className="text-xs text-slate-500 mt-1 mb-3">Tỉ lệ 1:1, dung lượng tối đa 2MB (PNG, JPG)</p>
                      <button className="px-4 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                        Tải ảnh lên
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">Tên phòng khám</label>
                      <input type="text" defaultValue="Nha khoa Mec" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">Giấy phép hoạt động</label>
                      <input type="text" defaultValue="12345/SYT-GPHĐ" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-slate-600">Địa chỉ</label>
                      <input type="text" defaultValue="123 Nguyễn Văn Linh, Phường Tân Phú, Quận 7, TP.HCM" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">Số điện thoại Hotline</label>
                      <input type="text" defaultValue="1900 1234" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">Email liên hệ</label>
                      <input type="email" defaultValue="contact@mec.vn" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-8">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  Giờ làm việc
                </h2>
                <div className="space-y-4">
                  {['Thứ 2 - Thứ 6', 'Thứ 7', 'Chủ nhật'].map((day, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                      <div className="flex items-center gap-3 w-40">
                        <input type="checkbox" defaultChecked={idx !== 2} className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                        <span className="text-sm font-bold text-slate-700">{day}</span>
                      </div>
                      <div className="flex items-center gap-4 flex-1 justify-end">
                        <input type="time" defaultValue={idx === 2 ? "" : "08:00"} disabled={idx === 2} className="px-3 py-1.5 border border-slate-200 rounded-md text-sm disabled:opacity-50" />
                        <span className="text-slate-400">-</span>
                        <input type="time" defaultValue={idx === 2 ? "" : "20:00"} disabled={idx === 2} className="px-3 py-1.5 border border-slate-200 rounded-md text-sm disabled:opacity-50" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-8">
              <h2 className="text-lg font-bold text-slate-800 mb-6">Cài đặt Thông báo & Nhắc hẹn</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Gửi SMS nhắc hẹn tự động</h3>
                    <p className="text-xs text-slate-500 mt-1">Hệ thống sẽ tự động gửi SMS trước giờ khám</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Thời gian nhắc trước</label>
                  <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                    <option>Trước 1 ngày</option>
                    <option>Trước 2 ngày</option>
                    <option>Trước 12 giờ</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Mẫu SMS nhắc hẹn</label>
                  <textarea rows="3" defaultValue="Nha khoa Mec nhắc hẹn: Quy khach [Ten_BN] co lich kham voi BS [Ten_BS] vao luc [Gio_Kham] ngay [Ngay_Kham]. Vui long den dung gio. Tran trong!" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none font-mono"></textarea>
                  <p className="text-[11px] text-slate-500">Các biến có sẵn: [Ten_BN], [Ten_BS], [Gio_Kham], [Ngay_Kham]</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-8">
              <h2 className="text-lg font-bold text-slate-800 mb-6">Cấu hình Hóa đơn & Thanh toán</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-600">Tên công ty xuất hóa đơn</label>
                  <input type="text" defaultValue="Công ty TNHH Nha khoa Mec" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Mã số thuế</label>
                  <input type="text" defaultValue="0312345678" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Tài khoản ngân hàng</label>
                  <input type="text" defaultValue="VCB - 1012345678 - NHA KHOA MEC" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-600">Ghi chú chân trang hóa đơn</label>
                  <textarea rows="2" defaultValue="Cảm ơn quý khách đã sử dụng dịch vụ của Nha khoa Mec. Chúc quý khách luôn có một nụ cười rạng rỡ!" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"></textarea>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-8">
              <h2 className="text-lg font-bold text-slate-800 mb-6">Sao lưu & Phục hồi dữ liệu</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 border border-emerald-100 rounded-xl bg-emerald-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px]">cloud_done</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Trạng thái: Đang an toàn</h3>
                      <p className="text-xs text-slate-500 mt-1">Bản sao lưu gần nhất: Hôm nay lúc 02:00 AM (2.4 GB)</p>
                    </div>
                  </div>
                  <button className="px-5 py-2 rounded-lg text-sm font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition-colors shadow-sm">
                    Tải xuống bản sao
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Lịch sao lưu tự động</label>
                    <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                      <option>Hàng ngày (Lúc 02:00 AM)</option>
                      <option>Hàng tuần</option>
                      <option>Thủ công</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Nơi lưu trữ</label>
                    <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                      <option>Google Drive (Mec Backup)</option>
                      <option>Máy chủ cục bộ</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-start">
                  <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-sm transition-colors">
                    <span className="material-symbols-outlined text-[18px]">backup</span>
                    Tiến hành sao lưu ngay
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-colors">
              Khôi phục mặc định
            </button>
            <button className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] shadow-sm transition-colors">
              Lưu cấu hình
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
