import React from 'react';

const RoleManagement = () => {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold">Hệ thống</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-gray-900 font-semibold">Quản lý người dùng</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[var(--color-primary)] font-semibold">Phân quyền chi tiết (RBAC)</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Phân quyền chi tiết</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Cấu hình ma trận quyền hạn cho từng vai trò trong hệ thống nha khoa.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
            Hủy thay đổi
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#1e40af] hover:bg-[#1e3a8a] transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">save</span>
            Lưu cấu hình
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden mb-8">
        
        {/* Top Config Bar */}
        <div className="px-8 py-6 border-b border-gray-100 flex flex-wrap items-center gap-8 bg-slate-50/30">
          <div className="space-y-1.5 w-64">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vai trò đang cấu hình</label>
            <div className="relative">
              <select className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer text-slate-800 shadow-sm">
                <option value="receptionist">Lễ tân</option>
                <option value="doctor">Bác sĩ</option>
                <option value="nurse">Y tá</option>
                <option value="admin">Quản trị viên</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">expand_more</span>
            </div>
          </div>
          <div className="space-y-1.5 flex-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mô tả vai trò</label>
            <p className="text-sm font-medium text-slate-600 py-2">Tiếp nhận bệnh nhân, quản lý lịch hẹn và thực hiện thanh toán cơ bản.</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold self-end mb-1">
            <span className="material-symbols-outlined text-[16px]">info</span>
            Đang chỉnh sửa: Lễ tân
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="px-8 py-4 text-xs tracking-wider uppercase">Module Hệ thống</th>
                <th className="px-6 py-4 text-xs tracking-wider uppercase text-center w-24">Xem</th>
                <th className="px-6 py-4 text-xs tracking-wider uppercase text-center w-24">Thêm</th>
                <th className="px-6 py-4 text-xs tracking-wider uppercase text-center w-24">Sửa</th>
                <th className="px-6 py-4 text-xs tracking-wider uppercase text-center w-24">Khóa/Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Row 1 */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Quản lý lịch khám</p>
                      <p className="text-xs text-slate-500 mt-0.5">Lịch hẹn, ca làm việc, nhắc hẹn</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-[#1e40af] border-slate-300 rounded focus:ring-[#1e40af] cursor-pointer" />
                </td>
                <td className="px-6 py-5 text-center">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-[#1e40af] border-slate-300 rounded focus:ring-[#1e40af] cursor-pointer" />
                </td>
                <td className="px-6 py-5 text-center">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-[#1e40af] border-slate-300 rounded focus:ring-[#1e40af] cursor-pointer" />
                </td>
                <td className="px-6 py-5 text-center">
                  <input type="checkbox" className="w-5 h-5 text-[#1e40af] border-slate-300 rounded focus:ring-[#1e40af] cursor-pointer" />
                </td>
              </tr>
              
              {/* Row 2 */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">medical_information</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Bệnh án</p>
                      <p className="text-xs text-slate-500 mt-0.5">Lịch sử điều trị, hình ảnh X-quang</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-[#1e40af] border-slate-300 rounded focus:ring-[#1e40af] cursor-pointer" />
                </td>
                <td className="px-6 py-5 text-center">
                  <input type="checkbox" className="w-5 h-5 text-[#1e40af] border-slate-300 rounded focus:ring-[#1e40af] cursor-pointer" />
                </td>
                <td className="px-6 py-5 text-center">
                  <input type="checkbox" className="w-5 h-5 text-[#1e40af] border-slate-300 rounded focus:ring-[#1e40af] cursor-pointer" />
                </td>
                <td className="px-6 py-5 text-center">
                  <input type="checkbox" className="w-5 h-5 text-[#1e40af] border-slate-300 rounded focus:ring-[#1e40af] cursor-pointer" />
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Thanh toán</p>
                      <p className="text-xs text-slate-500 mt-0.5">Hóa đơn, công nợ, bảo hiểm</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-[#1e40af] border-slate-300 rounded focus:ring-[#1e40af] cursor-pointer" />
                </td>
                <td className="px-6 py-5 text-center">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-[#1e40af] border-slate-300 rounded focus:ring-[#1e40af] cursor-pointer" />
                </td>
                <td className="px-6 py-5 text-center">
                  <input type="checkbox" className="w-5 h-5 text-[#1e40af] border-slate-300 rounded focus:ring-[#1e40af] cursor-pointer" />
                </td>
                <td className="px-6 py-5 text-center">
                  <input type="checkbox" className="w-5 h-5 text-[#1e40af] border-slate-300 rounded focus:ring-[#1e40af] cursor-pointer" />
                </td>
              </tr>

              {/* Row 4 */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">bar_chart</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Báo cáo</p>
                      <p className="text-xs text-slate-500 mt-0.5">Doanh thu, hiệu suất nha sĩ</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <input type="checkbox" className="w-5 h-5 text-[#1e40af] border-slate-300 rounded focus:ring-[#1e40af] cursor-pointer" />
                </td>
                <td className="px-6 py-5 text-center">
                  <input type="checkbox" disabled className="w-5 h-5 bg-slate-100 border-slate-200 rounded cursor-not-allowed" />
                </td>
                <td className="px-6 py-5 text-center">
                  <input type="checkbox" disabled className="w-5 h-5 bg-slate-100 border-slate-200 rounded cursor-not-allowed" />
                </td>
                <td className="px-6 py-5 text-center">
                  <input type="checkbox" disabled className="w-5 h-5 bg-slate-100 border-slate-200 rounded cursor-not-allowed" />
                </td>
              </tr>

              {/* Row 5 */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Quản lý người dùng</p>
                      <p className="text-xs text-slate-500 mt-0.5">Tài khoản nhân viên, phân quyền</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <input type="checkbox" className="w-5 h-5 text-[#1e40af] border-slate-300 rounded focus:ring-[#1e40af] cursor-pointer" />
                </td>
                <td className="px-6 py-5 text-center">
                  <input type="checkbox" className="w-5 h-5 text-[#1e40af] border-slate-300 rounded focus:ring-[#1e40af] cursor-pointer" />
                </td>
                <td className="px-6 py-5 text-center">
                  <input type="checkbox" className="w-5 h-5 text-[#1e40af] border-slate-300 rounded focus:ring-[#1e40af] cursor-pointer" />
                </td>
                <td className="px-6 py-5 text-center">
                  <input type="checkbox" className="w-5 h-5 text-[#1e40af] border-slate-300 rounded focus:ring-[#1e40af] cursor-pointer" />
                </td>
              </tr>
              
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="px-8 py-4 border-t border-gray-100 bg-slate-50/50 flex justify-between items-center">
          <p className="text-[11px] italic text-slate-500">* Các ô màu xám biểu thị quyền mặc định không khả dụng cho vai trò này để đảm bảo an toàn hệ thống.</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 border border-slate-300 rounded bg-white"></div>
              <span className="text-xs text-slate-500">Chưa chọn</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-[#1e40af]"></div>
              <span className="text-xs text-slate-500">Đã chọn</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* History */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Lịch sử thay đổi quyền gần đây</h3>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">Xem tất cả</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/80">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[16px]">history</span>
              </div>
              <div>
                <p className="text-sm text-slate-700 font-medium">
                  <span className="font-bold text-slate-900">Dr. Smith</span> đã cập nhật quyền <span className="font-bold">"Thanh toán"</span> cho vai trò <span className="font-bold">Lễ tân</span>.
                </p>
                <p className="text-xs text-slate-400 mt-1">10 phút trước • IP: 192.168.1.15</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Guide */}
        <div className="bg-[#1e40af] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-bl-full -mr-8 -mt-8"></div>
          <h3 className="text-lg font-bold mb-3">Hướng dẫn bảo mật</h3>
          <p className="text-sm text-blue-100/90 leading-relaxed">
            Luôn áp dụng nguyên tắc "Quyền hạn tối thiểu". Chỉ cấp những quyền thực sự cần thiết cho công việc để giảm thiểu rủi ro bảo mật dữ liệu bệnh nhân.
          </p>
        </div>
      </div>

    </div>
  );
};

export default RoleManagement;
