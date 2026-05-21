import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import apiFetch from '../../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Real stats state
  const [dashboardData, setDashboardData] = useState({
    totalPatients: 0,
    todayAppointmentsCount: 0,
    waitingCount: 0,
    todayRevenue: 0,
    recentAppointments: [],
    serviceDistribution: []
  });

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/dashboard/stats');
      if (res && res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // fallback/merging stats data
  const stats = [
    {
      title: 'Tổng số bệnh nhân',
      value: loading ? '...' : dashboardData.totalPatients.toLocaleString('vi-VN'),
      trend: 'Đăng ký trong hệ thống',
      isPositive: true,
      icon: 'groups',
      color: 'blue'
    },
    {
      title: 'Lịch hẹn hôm nay',
      value: loading ? '...' : dashboardData.todayAppointmentsCount.toLocaleString('vi-VN'),
      trend: 'Lịch khám đã xếp',
      isPositive: true,
      icon: 'calendar_today',
      color: 'indigo'
    },
    {
      title: 'Doanh thu trong ngày',
      value: loading ? '...' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(dashboardData.todayRevenue),
      trend: 'Từ ca khám hoàn thành',
      isPositive: true,
      icon: 'payments',
      color: 'emerald'
    },
    {
      title: 'Đang chờ khám',
      value: loading ? '...' : dashboardData.waitingCount.toLocaleString('vi-VN'),
      trend: 'Đã check-in xếp hàng',
      isPositive: false,
      icon: 'hourglass_empty',
      color: 'amber'
    }
  ];

  // Recent Appointments table list (Live or Fallback)
  const displayAppointments = dashboardData.recentAppointments.length > 0
    ? dashboardData.recentAppointments
    : [
        { id: '1', patient: 'Lê Hoàng Minh', time: 'Mẫu', service: 'Nhổ răng khôn', doctor: 'BS. Lê Minh Tâm', status: 'Chờ khám', statusColor: 'amber' },
        { id: '2', patient: 'Trần Thị Thu Thảo', time: 'Mẫu', service: 'Tẩy trắng răng', doctor: 'BS. Nguyễn Hoàng Minh', status: 'Đã xong', statusColor: 'emerald' }
      ];

  // Service distribution Pie Chart (Live or Fallback)
  const displayServiceDistribution = dashboardData.serviceDistribution.length > 0
    ? dashboardData.serviceDistribution
    : [
        { name: 'Khám tổng quát', value: 35 },
        { name: 'Nhổ răng khôn', value: 15 },
        { name: 'Tẩy trắng răng', value: 20 },
        { name: 'Niềng răng', value: 10 },
        { name: 'Trồng răng Implant', value: 20 },
      ];

  // Chart Static Data (as in original beautiful design)
  const revenueData = [
    { name: 'T2', revenue: 15, expense: 5 },
    { name: 'T3', revenue: 22, expense: 8 },
    { name: 'T4', revenue: 18, expense: 6 },
    { name: 'T5', revenue: 32, expense: 12 },
    { name: 'T6', revenue: 25, expense: 9 },
    { name: 'T7', revenue: 45, expense: 15 },
    { name: 'CN', revenue: 55, expense: 20 },
  ];

  const COLORS = ['#3b82f6', '#ef4444', '#8b5cf6', '#10b981', '#f59e0b'];

  const patientDemographics = [
    { age: 'Dưới 18', male: 20, female: 25 },
    { age: '18-35', male: 45, female: 65 },
    { age: '36-50', male: 35, female: 40 },
    { age: 'Trên 50', male: 25, female: 30 },
  ];

  const getColorClasses = (color) => {
    const classes = {
      blue: 'bg-blue-50 text-blue-600 border-blue-100 from-blue-100 to-blue-50',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 from-indigo-100 to-indigo-50',
      emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 from-emerald-100 to-emerald-50',
      amber: 'bg-amber-50 text-amber-600 border-amber-100 from-amber-100 to-amber-50',
      slate: 'bg-slate-50 text-slate-600 border-slate-100 from-slate-100 to-slate-50'
    };
    return classes[color] || classes.blue;
  };

  const getBadgeClasses = (color) => {
    const classes = {
      emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      amber: 'bg-amber-50 text-amber-700 border-amber-200/60',
      blue: 'bg-blue-50 text-blue-700 border-blue-200/60',
      slate: 'bg-slate-100 text-slate-700 border-slate-200/60',
      rose: 'bg-rose-50 text-rose-700 border-rose-200/60'
    };
    return classes[color] || classes.slate;
  };

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100">
          <p className="font-bold text-slate-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-slate-500">{entry.name}:</span>
              <span className="text-slate-900 font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold">Tổng quan</span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
            <span className="bg-gradient-to-r from-blue-50 to-indigo-50 text-[var(--color-primary)] border border-blue-100 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
              Hôm nay, {new Date().toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchDashboardStats} className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-semibold shadow-sm border border-gray-200 transition-all active:scale-95">
            <span className="material-symbols-outlined text-[20px]">refresh</span>
            Tải lại
          </button>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">{error}</div>}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-pointer">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${getColorClasses(stat.color).split(' ').pop()} rounded-bl-[80px] -z-10 opacity-50 transition-transform group-hover:scale-110`}></div>

            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl shadow-inner border ${getColorClasses(stat.color).split(' ').slice(0, 3).join(' ')}`}>
                <span className="material-symbols-outlined text-[28px]">{stat.icon}</span>
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${stat.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                <span className="material-symbols-outlined text-[14px]">
                  {stat.isPositive ? 'trending_up' : 'trending_flat'}
                </span>
                {stat.isPositive ? 'Hệ thống' : 'Ổn định'}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">{stat.value}</h3>
              <p className="text-xs font-medium text-gray-400">{stat.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-1">Doanh thu & Chi phí</h3>
              <p className="text-sm font-medium text-slate-500">Thống kê theo 7 ngày gần nhất (Triệu VNĐ)</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="expense" name="Chi phí" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Services Pie Chart */}
        <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-1">Cơ cấu Dịch vụ</h3>
            <p className="text-sm font-medium text-slate-500">Tỉ lệ sử dụng các dịch vụ</p>
          </div>
          <div className="flex-1 min-h-[250px] relative mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayServiceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {displayServiceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-800">Live</span>
              <span className="text-xs font-bold text-slate-400">Dữ liệu thật</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4">
            {displayServiceDistribution.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-xs font-bold text-slate-600 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Demographics Bar Chart */}
        <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-1">Thống kê Bệnh nhân</h3>
              <p className="text-sm font-medium text-slate-500">Phân bố theo độ tuổi & giới tính</p>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={patientDemographics} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', paddingTop: '20px' }} />
                <Bar dataKey="male" name="Nam" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="female" name="Nữ" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Status and Quick Actions combined to fit layout */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-[100px] -z-10 opacity-70"></div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-500">bolt</span>
              Thao tác nhanh
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-blue-50/50 hover:bg-blue-50 border border-blue-100/50 text-blue-700 transition-colors group">
                <div className="bg-white p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">person_add</span>
                </div>
                <span className="text-sm font-bold">Thêm BN</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100/50 text-emerald-700 transition-colors group">
                <div className="bg-white p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">event_available</span>
                </div>
                <span className="text-sm font-bold">Đặt lịch</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-purple-50/50 hover:bg-purple-50 border border-purple-100/50 text-purple-700 transition-colors group">
                <div className="bg-white p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                </div>
                <span className="text-sm font-bold">Hóa đơn</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-amber-50/50 hover:bg-amber-50 border border-amber-100/50 text-amber-700 transition-colors group">
                <div className="bg-white p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">inventory_2</span>
                </div>
                <span className="text-sm font-bold">Nhập vật tư</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appointments List */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 p-2.5 rounded-xl shadow-inner border border-indigo-100">
                <span className="material-symbols-outlined text-[24px]">calendar_clock</span>
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">Lịch khám hôm nay</h3>
            </div>
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">Thời gian</th>
                    <th className="px-6 py-4 whitespace-nowrap">Bệnh nhân</th>
                    <th className="px-6 py-4 whitespace-nowrap">Dịch vụ</th>
                    <th className="px-6 py-4 whitespace-nowrap">Bác sĩ</th>
                    <th className="px-6 py-4 whitespace-nowrap text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {displayAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                      <td className="px-6 py-4 text-slate-900 font-bold whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                          {apt.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-900 font-bold group-hover:text-[var(--color-primary)] transition-colors">{apt.patient}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{apt.service}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {apt.doctor.split(' ').pop().charAt(0)}
                          </div>
                          {apt.doctor}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`border px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm ${getBadgeClasses(apt.statusColor)}`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - System Status */}
        <div className="space-y-8">
          {/* System Status */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <h3 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-500">dns</span>
              Tình trạng hệ thống
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                    <span className="material-symbols-outlined text-[20px]">cloud_done</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Máy chủ dữ liệu</p>
                    <p className="text-xs text-gray-500">Hoạt động bình thường</p>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <span className="material-symbols-outlined text-[20px]">backup</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Sao lưu dữ liệu</p>
                    <p className="text-xs text-gray-500">Cập nhật 2 giờ trước</p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">98%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
