import React from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

const PatientServiceReport = () => {
  const ageData = [
    { name: 'Dưới 18', value: 15 },
    { name: '18 - 30', value: 45 },
    { name: '31 - 50', value: 30 },
    { name: 'Trên 50', value: 10 },
  ];
  
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  const servicesData = [
    { name: 'Khám tổng quát', count: 320, trend: 'up' },
    { name: 'Niềng răng', count: 150, trend: 'up' },
    { name: 'Nhổ răng khôn', count: 120, trend: 'down' },
    { name: 'Tẩy trắng răng', count: 95, trend: 'up' },
    { name: 'Implant', count: 60, trend: 'up' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Bệnh nhân & Dịch vụ</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Phân tích nhân khẩu học khách hàng và xu hướng sử dụng dịch vụ</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-slate-600 bg-white border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            Tháng 10/2023
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col items-center">
          <h3 className="text-lg font-bold text-slate-800 mb-2 w-full text-left">Phân bố Độ tuổi Khách hàng</h3>
          <p className="text-sm text-slate-500 font-medium mb-6 w-full text-left">Nhóm khách hàng mục tiêu mang lại doanh thu chính</p>
          
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Dịch vụ sử dụng nhiều nhất</h3>
          <p className="text-sm text-slate-500 font-medium mb-6">Top 5 dịch vụ được đăng ký nhiều nhất trong tháng</p>
          
          <div className="space-y-4">
            {servicesData.map((svc, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-indigo-500' : idx === 2 ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                    {idx + 1}
                  </div>
                  <span className="font-bold text-slate-800">{svc.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-extrabold text-slate-700">{svc.count} <span className="text-xs font-medium text-slate-500">lượt</span></span>
                  {svc.trend === 'up' ? (
                    <span className="material-symbols-outlined text-emerald-500 text-[20px]">trending_up</span>
                  ) : (
                    <span className="material-symbols-outlined text-rose-500 text-[20px]">trending_down</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientServiceReport;
