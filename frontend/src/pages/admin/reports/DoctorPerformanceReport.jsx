import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DoctorPerformanceReport = () => {
  const performanceData = [
    { name: 'Dr. Nguyễn Văn A', appointments: 120, rating: 4.9, revenue: 150 },
    { name: 'Dr. Trần Thị B', appointments: 98, rating: 4.8, revenue: 120 },
    { name: 'Dr. Lê Minh C', appointments: 86, rating: 4.7, revenue: 90 },
    { name: 'Dr. Phạm Hoàng D', appointments: 110, rating: 4.9, revenue: 135 },
    { name: 'Dr. Vũ Thu E', appointments: 65, rating: 4.6, revenue: 70 },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hiệu suất Bác sĩ</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Phân tích hiệu quả làm việc, đánh giá và doanh thu theo từng bác sĩ tháng 10/2023</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-slate-600 bg-white border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            Tháng 10/2023
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-bold text-slate-500">Bác sĩ có doanh thu cao nhất</p>
            <span className="material-symbols-outlined text-amber-500">workspace_premium</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">A</div>
            <div>
              <p className="text-lg font-extrabold text-slate-800">Dr. Nguyễn Văn A</p>
              <p className="text-sm font-medium text-slate-500">150.000.000 đ</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-bold text-slate-500">Bác sĩ khám nhiều nhất</p>
            <span className="material-symbols-outlined text-blue-500">groups</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">A</div>
            <div>
              <p className="text-lg font-extrabold text-slate-800">Dr. Nguyễn Văn A</p>
              <p className="text-sm font-medium text-slate-500">120 lượt khám</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-bold text-slate-500">Đánh giá trung bình cao nhất</p>
            <span className="material-symbols-outlined text-rose-500">favorite</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">D</div>
            <div>
              <p className="text-lg font-extrabold text-slate-800">Dr. Phạm Hoàng D</p>
              <p className="text-sm font-medium text-slate-500">4.9 / 5.0 sao</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart and List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 h-[450px] flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Số lượt khám & Doanh thu (Triệu VNĐ)</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 'bold' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }} />
                <Bar dataKey="appointments" name="Lượt khám" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" name="Doanh thu (Tr VNĐ)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed List */}
        <div className="bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden flex flex-col h-[450px]">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Chi tiết hiệu suất</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Bác sĩ</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-center">Đánh giá</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-right">Tổng Lượt khám</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {performanceData.map((doc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">{doc.name.charAt(4)}</div>
                        <span className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-sm bg-amber-50 px-2 py-1 rounded-md w-max mx-auto">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        {doc.rating}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-extrabold text-slate-700">
                      {doc.appointments}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPerformanceReport;
