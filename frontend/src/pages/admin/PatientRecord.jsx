import React, { useState } from 'react';

const PatientRecord = () => {
  const [isAddVisitModalOpen, setIsAddVisitModalOpen] = useState(false);
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="hover:text-[var(--color-primary)] cursor-pointer transition-colors">Bệnh nhân</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-gray-900 font-semibold">Hồ sơ bệnh án</span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hồ sơ bệnh án</h1>
            <span className="bg-gradient-to-r from-blue-50 to-indigo-50 text-[var(--color-primary)] border border-blue-100 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">BN-2023-001</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-semibold shadow-sm border border-gray-200 transition-all hover:-translate-y-0.5">
            <span className="material-symbols-outlined text-[20px]">print</span>
            In hồ sơ
          </button>
          <button 
            onClick={() => setIsAddVisitModalOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-[var(--color-primary)] px-5 py-2.5 rounded-xl font-semibold shadow-sm border border-blue-100 transition-all hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            Thêm lần khám
          </button>
          <button className="flex items-center gap-2 bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white px-7 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5">
            <span className="material-symbols-outlined text-[20px]">save</span>
            Lưu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="space-y-8 lg:col-span-1">
          {/* Patient Info Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
            {/* Decorative background blob */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-bl-[100px] -z-10 opacity-70"></div>
            
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 text-[var(--color-primary)] rounded-2xl shadow-inner flex items-center justify-center text-2xl font-black border border-blue-50">
                NA
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">Nguyễn Văn A</h3>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1.5 font-medium bg-green-50 px-2 py-0.5 rounded-md inline-flex">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Cập nhật 2 ngày trước
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <p className="text-sm text-gray-500 font-medium">Họ và tên</p>
                <p className="text-sm font-bold text-gray-900">Nguyễn Văn A</p>
              </div>
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <p className="text-sm text-gray-500 font-medium">Giới tính / Tuổi</p>
                <p className="text-sm font-bold text-gray-900">Nam • 30 tuổi</p>
              </div>
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <p className="text-sm text-gray-500 font-medium">Số điện thoại</p>
                <p className="text-sm font-bold text-gray-900">090 123 4567</p>
              </div>
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <p className="text-sm text-gray-500 font-medium">Bác sĩ phụ trách</p>
                <p className="text-sm font-bold text-[var(--color-primary)] flex items-center gap-1.5 bg-[var(--color-primary-container)]/10 px-3 py-1 rounded-lg">
                  <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                  BS. Trần Văn B
                </p>
              </div>
              <div className="pt-2">
                <p className="text-sm text-gray-500 font-medium mb-3">Tóm tắt tình trạng</p>
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-2xl text-sm text-gray-700 leading-relaxed border border-gray-100 shadow-sm">
                  Khám định kỳ, đang điều trị răng số <span className="font-bold text-primary">36</span>. Cần theo dõi tủy.
                </div>
              </div>
            </div>
          </div>

          {/* Appointment History */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <h3 className="text-lg font-extrabold text-gray-900 mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500">history</span>
              Lịch sử khám
            </h3>
            <div className="relative pl-6 border-l-2 border-gray-100 space-y-8">
              <div className="relative group cursor-pointer">
                <div className="absolute w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full -left-[33px] top-1 border-4 border-white shadow-md transition-transform group-hover:scale-125"></div>
                <div className="bg-blue-50/50 hover:bg-blue-50 border border-blue-100/50 rounded-2xl p-4 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-blue-700">15/10/2023</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-1 rounded-md text-blue-600 shadow-sm border border-blue-50">Mới nhất</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">Khám định kỳ, cạo vôi răng. Phát hiện sâu răng nhẹ...</p>
                </div>
              </div>
              <div className="relative group cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                <div className="absolute w-4 h-4 bg-gray-300 rounded-full -left-[33px] top-1 border-4 border-white transition-transform group-hover:scale-125"></div>
                <div className="p-2">
                  <p className="text-sm font-bold text-gray-500 mb-1">02/04/2023</p>
                  <p className="text-sm text-gray-500">Trám răng R14...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Dental Chart */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--color-primary)]">dentistry</span>
                Sơ đồ răng (FDI)
              </h3>
              <button className="flex items-center gap-2 text-[var(--color-primary)] bg-[var(--color-primary-container)]/10 hover:bg-[var(--color-primary-container)]/20 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Cập nhật
              </button>
            </div>
            
            <div className="bg-[#f8fafc] rounded-3xl p-8 mb-6 overflow-x-auto border border-slate-100 shadow-inner">
              <div className="flex flex-col items-center gap-10 min-w-[650px]">
                {/* Upper Teeth */}
                <div className="flex gap-6 border-b-[3px] border-slate-200 pb-8 w-full justify-center relative">
                  <div className="absolute -bottom-3 bg-[#f8fafc] px-4 text-slate-400 font-bold text-xs tracking-widest uppercase">Hàm Trên</div>
                  {/* Quadrant 1 */}
                  <div className="flex gap-2 border-r-[3px] border-slate-200 pr-6">
                    {[18, 17, 16, 15, 14, 13, 12, 11].map(num => (
                      <div key={num} className="flex flex-col items-center gap-3 group cursor-pointer">
                        <span className="text-[11px] text-slate-500 font-bold group-hover:text-primary transition-colors">{num}</span>
                        <div className={`w-9 h-12 rounded-xl border-2 transition-all group-hover:-translate-y-1 group-hover:shadow-md ${
                          num === 16 ? 'border-green-400 bg-green-100 shadow-[0_0_15px_rgba(74,222,128,0.3)]' :
                          num === 14 ? 'border-blue-400 bg-blue-100 shadow-[0_0_15px_rgba(96,165,250,0.3)]' :
                          'border-slate-200 bg-white'
                        }`}></div>
                      </div>
                    ))}
                  </div>
                  {/* Quadrant 2 */}
                  <div className="flex gap-2 pl-6">
                    {[21, 22, 23, 24, 25, 26, 27, 28].map(num => (
                      <div key={num} className="flex flex-col items-center gap-3 group cursor-pointer">
                        <span className="text-[11px] text-slate-500 font-bold group-hover:text-primary transition-colors">{num}</span>
                        <div className={`w-9 h-12 rounded-xl border-2 transition-all group-hover:-translate-y-1 group-hover:shadow-md ${
                          num === 26 ? 'border-purple-400 bg-purple-100 shadow-[0_0_15px_rgba(192,132,252,0.3)]' :
                          'border-slate-200 bg-white'
                        }`}></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lower Teeth */}
                <div className="flex gap-6 pt-6 w-full justify-center relative">
                  <div className="absolute -top-3 bg-[#f8fafc] px-4 text-slate-400 font-bold text-xs tracking-widest uppercase">Hàm Dưới</div>
                  {/* Quadrant 4 */}
                  <div className="flex gap-2 border-r-[3px] border-slate-200 pr-6">
                    {[48, 47, 46, 45, 44, 43, 42, 41].map(num => (
                      <div key={num} className="flex flex-col items-center gap-3 group cursor-pointer">
                        <div className="w-9 h-12 bg-white border-2 border-slate-200 rounded-xl transition-all group-hover:translate-y-1 group-hover:shadow-md"></div>
                        <span className="text-[11px] text-slate-500 font-bold group-hover:text-primary transition-colors">{num}</span>
                      </div>
                    ))}
                  </div>
                  {/* Quadrant 3 */}
                  <div className="flex gap-2 pl-6">
                    {[31, 32, 33, 34, 35, 36, 37, 38].map(num => (
                      <div key={num} className="flex flex-col items-center gap-3 group cursor-pointer">
                        <div className={`w-9 h-12 rounded-xl border-2 transition-all group-hover:translate-y-1 group-hover:shadow-md ${
                          num === 36 ? 'border-red-400 bg-red-100 shadow-[0_0_15px_rgba(248,113,113,0.3)]' :
                          'border-slate-200 bg-white'
                        }`}></div>
                        <span className="text-[11px] text-slate-500 font-bold group-hover:text-primary transition-colors">{num}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-gray-600 bg-white px-6 py-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></div>Khỏe mạnh</div>
              <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></div>Sâu răng</div>
              <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></div>Đã trám</div>
              <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full bg-slate-300 shadow-sm shadow-slate-300/50"></div>Mất răng</div>
              <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50"></div>Chữa tủy</div>
            </div>
          </div>

          {/* Clinical Exam */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 p-2.5 rounded-xl shadow-inner border border-indigo-100">
                <span className="material-symbols-outlined text-[24px]">clinical_notes</span>
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">Khám lâm sàng</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Chẩn đoán
                </p>
                <div className="bg-slate-50 p-5 rounded-2xl text-sm text-slate-700 min-h-[120px] border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-sm">
                  Sâu răng mặt nhai R36, viêm tủy không hồi phục.
                </div>
              </div>
              <div className="row-span-2 space-y-3">
                <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Chỉ định
                </p>
                <div className="bg-slate-50 p-5 rounded-2xl text-sm text-slate-700 h-full min-h-[120px] border border-slate-100 focus-within:ring-2 focus-within:ring-green-100 transition-all shadow-sm leading-relaxed">
                  <ul className="list-disc pl-4 space-y-2">
                    <li>Chụp X-quang quanh chóp R36.</li>
                    <li>Lấy tủy toàn bộ R36.</li>
                    <li>Kê đơn: Amoxicillin 500mg, Paracetamol 500mg.</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Ghi chú lâm sàng
                </p>
                <div className="bg-slate-50 p-5 rounded-2xl text-sm text-slate-700 min-h-[100px] border border-slate-100 focus-within:ring-2 focus-within:ring-amber-100 transition-all shadow-sm">
                  Răng 36 đau khi gõ, nhạy cảm nhiệt độ cao.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Treatment Plan Section */}
      <div className="mt-8 bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 p-2.5 rounded-xl shadow-inner border border-emerald-100">
              <span className="material-symbols-outlined text-[24px]">medical_services</span>
            </div>
            <h3 className="text-xl font-extrabold text-gray-900">Kế hoạch điều trị</h3>
          </div>
          <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-slate-900/20 transition-transform hover:-translate-y-0.5">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Thêm dịch vụ
          </button>
        </div>

        <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Ngày lập</th>
                  <th className="px-6 py-4 whitespace-nowrap">Dịch vụ / Điều trị</th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">Răng</th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">SL</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">Đơn giá</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">Thành tiền</th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-slate-900 font-medium whitespace-nowrap">15/10/2023</td>
                  <td className="px-6 py-4 text-slate-900 font-bold group-hover:text-primary transition-colors">Chữa tủy răng hàm nhỏ</td>
                  <td className="px-6 py-4 text-slate-600 text-center font-medium">36</td>
                  <td className="px-6 py-4 text-slate-900 text-center font-bold">1</td>
                  <td className="px-6 py-4 text-slate-500 text-right">1,500,000đ</td>
                  <td className="px-6 py-4 text-slate-900 text-right font-black">1,500,000đ</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-amber-50 text-amber-700 border border-amber-200/60 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm">Đang điều trị</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-slate-900 font-medium whitespace-nowrap">15/10/2023</td>
                  <td className="px-6 py-4 text-slate-900 font-bold group-hover:text-primary transition-colors">Chụp X-quang quanh chóp</td>
                  <td className="px-6 py-4 text-slate-600 text-center font-medium">36</td>
                  <td className="px-6 py-4 text-slate-900 text-center font-bold">1</td>
                  <td className="px-6 py-4 text-slate-500 text-right">150,000đ</td>
                  <td className="px-6 py-4 text-slate-900 text-right font-black">150,000đ</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm">Hoàn thành</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Visit Modal */}
      {isAddVisitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
              <h2 className="text-lg font-extrabold text-slate-800">Thêm Lần Khám Mới</h2>
              <button onClick={() => setIsAddVisitModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Ngày khám <span className="text-rose-500">*</span></label>
                  <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Bác sĩ phụ trách <span className="text-rose-500">*</span></label>
                  <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                    <option>BS. Trần Văn B</option>
                    <option>BS. Nguyễn Văn A</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Lý do đến khám <span className="text-rose-500">*</span></label>
                <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="VD: Đau nhức răng hàm dưới bên trái" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Chẩn đoán lâm sàng</label>
                <textarea rows="3" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none" placeholder="Nhập tình trạng quan sát được..."></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Chỉ định điều trị</label>
                <textarea rows="3" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none" placeholder="Hướng điều trị, đơn thuốc..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Nhắc hẹn tái khám</label>
                  <input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 sticky bottom-0 z-10">
              <button onClick={() => setIsAddVisitModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">Hủy</button>
              <button className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">Lưu hồ sơ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRecord;
