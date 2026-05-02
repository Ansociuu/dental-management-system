import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RevenueReport = () => {
  const data = [
    { name: 'T1', actual: 400, predict: 420 },
    { name: 'T2', actual: 300, predict: 350 },
    { name: 'T3', actual: 550, predict: 500 },
    { name: 'T4', actual: 450, predict: 480 },
    { name: 'T5', actual: 700, predict: 650 },
    { name: 'T6', actual: 600, predict: 680 },
    { name: 'T7', actual: 800, predict: 750 },
    { name: 'T8', actual: 750, predict: 800 },
    { name: 'T9', actual: 950, predict: 900 },
    { name: 'T10', actual: 1240, predict: 1100 },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Báo cáo Doanh thu</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Phân tích chi tiết hiệu suất tài chính tháng 10/2023</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-slate-600 bg-white border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            01/10/2023 - 31/10/2023
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between h-[160px]">
          <div className="flex justify-between items-start">
            <p className="text-sm font-bold text-slate-500">Tổng doanh thu</p>
            <span className="material-symbols-outlined text-slate-200 text-[32px]">payments</span>
          </div>
          <div>
            <p className="text-[28px] font-extrabold text-slate-800 mb-2">1,240,000,000 đ</p>
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +12.5% so với tháng trước
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between h-[160px]">
          <div className="flex justify-between items-start">
            <p className="text-sm font-bold text-slate-500">Bệnh nhân mới</p>
            <span className="material-symbols-outlined text-slate-200 text-[32px]">person_add</span>
          </div>
          <div>
            <p className="text-[28px] font-extrabold text-slate-800 mb-2">142</p>
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +8.2% so với tháng trước
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between h-[160px]">
          <div className="flex justify-between items-start">
            <p className="text-sm font-bold text-slate-500">Lịch hẹn hoàn thành</p>
            <span className="material-symbols-outlined text-slate-200 text-[32px]">event_available</span>
          </div>
          <div>
            <p className="text-[28px] font-extrabold text-slate-800 mb-2">856</p>
            <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_flat</span>
              Ổn định
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between h-[160px]">
          <div className="flex justify-between items-start">
            <p className="text-sm font-bold text-slate-500">Mức độ hài lòng</p>
            <span className="material-symbols-outlined text-slate-200 text-[32px]">verified</span>
          </div>
          <div>
            <p className="text-[28px] font-extrabold text-slate-800 mb-2">4.8 / 5.0</p>
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              98% phản hồi tích cực
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Tăng trưởng doanh thu 2023</h3>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#1e40af]"></span>
                <span className="text-slate-500">Thực tế</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                <span className="text-slate-500">Dự báo</span>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 'bold' }}
                  labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                />
                <Line type="monotone" dataKey="actual" stroke="#1e40af" strokeWidth={4} dot={{ r: 4, fill: '#1e40af', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="Thực tế" />
                <Line type="monotone" dataKey="predict" stroke="#cbd5e1" strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={false} name="Dự báo" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Allocation */}
        <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Phân bổ dịch vụ</h3>
          
          <div className="space-y-6 flex-1">
            {/* Item 1 */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-slate-600">Niềng răng</span>
                <span className="text-sm font-extrabold text-slate-800">420 tr <span className="text-slate-400 font-semibold">(34%)</span></span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#1e40af] rounded-full" style={{ width: '34%' }}></div>
              </div>
            </div>

            {/* Item 2 */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-slate-600">Implant</span>
                <span className="text-sm font-extrabold text-slate-800">310 tr <span className="text-slate-400 font-semibold">(25%)</span></span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>

            {/* Item 3 */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-slate-600">Răng sứ thẩm mỹ</span>
                <span className="text-sm font-extrabold text-slate-800">248 tr <span className="text-slate-400 font-semibold">(20%)</span></span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>

            {/* Item 4 */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-slate-600">Khám & Điều trị tổng quát</span>
                <span className="text-sm font-extrabold text-slate-800">186 tr <span className="text-slate-400 font-semibold">(15%)</span></span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>

            {/* Item 5 */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-slate-600">Khác</span>
                <span className="text-sm font-extrabold text-slate-800">76 tr <span className="text-slate-400 font-semibold">(6%)</span></span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full" style={{ width: '6%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueReport;
