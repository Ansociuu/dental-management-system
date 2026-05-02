import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
  PieChart, Pie, Cell
} from 'recharts';

const Dashboard = () => {
  const stats = [
    {
      title: 'Tổng số bệnh nhân',
      value: '1,248',
      trend: '+12% so với tháng trước',
      isPositive: true,
      icon: 'groups',
      color: 'blue'
    },
    {
      title: 'Lịch hẹn hôm nay',
      value: '24',
      trend: '4 lịch hẹn mới',
      isPositive: true,
      icon: 'calendar_today',
      color: 'indigo'
    },
    {
      title: 'Doanh thu trong ngày',
      value: '15.4M',
      trend: '+5.2% so với hôm qua',
      isPositive: true,
      icon: 'payments',
      color: 'emerald'
    },
    {
      title: 'Đang chờ khám',
      value: '3',
      trend: 'Thời gian chờ TB: 15p',
      isPositive: false,
      icon: 'hourglass_empty',
      color: 'amber'
    }
  ];

  const recentAppointments = [
    { id: '1', patient: 'Nguyễn Văn A', time: '08:30', service: 'Khám định kỳ', doctor: 'BS. Trần Văn B', status: 'Đã hoàn thành', statusColor: 'emerald' },
    { id: '2', patient: 'Trần Thị B', time: '09:00', service: 'Nhổ răng khôn', doctor: 'BS. Lê Thị C', status: 'Đang khám', statusColor: 'amber' },
    { id: '3', patient: 'Lê Văn C', time: '10:00', service: 'Chữa tủy', doctor: 'BS. Nguyễn Văn D', status: 'Chờ khám', statusColor: 'blue' },
    { id: '4', patient: 'Phạm Thị D', time: '10:30', service: 'Niềng răng', doctor: 'BS. Trần Văn B', status: 'Sắp tới', statusColor: 'slate' },
    { id: '5', patient: 'Hoàng Văn E', time: '11:00', service: 'Tẩy trắng răng', doctor: 'BS. Lê Thị C', status: 'Sắp tới', statusColor: 'slate' },
  ];

  // Chart Data
  const revenueData = [
    { name: 'T2', revenue: 45, expense: 20 },
    { name: 'T3', revenue: 52, expense: 22 },
    { name: 'T4', revenue: 38, expense: 18 },
    { name: 'T5', revenue: 65, expense: 25 },
    { name: 'T6', revenue: 48, expense: 21 },
    { name: 'T7', revenue: 85, expense: 30 },
    { name: 'CN', revenue: 95, expense: 35 },
  ];

  const serviceData = [
    { name: 'Khám tổng quát', value: 35 },
    { name: 'Nhổ răng', value: 15 },
    { name: 'Chữa tủy', value: 20 },
    { name: 'Niềng răng', value: 10 },
    { name: 'Tẩy trắng', value: 20 },
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
      slate: 'bg-slate-100 text-slate-700 border-slate-200/60'
    };
    return classes[color] || classes.slate;
  }

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
      <div className="flex justify-between items-end mb-8">
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
          <button className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-semibold shadow-sm border border-gray-200 transition-all hover:-translate-y-0.5">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Bộ lọc
          </button>
          <button className="flex items-center gap-2 bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white px-7 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Xuất báo cáo
          </button>
        </div>
      </div>

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
                {stat.isPositive ? 'Tăng' : 'Ổn định'}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">{stat.title}</p>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-2">{stat.value}</h3>
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
            <select className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2 font-semibold text-sm outline-none focus:border-blue-500">
              <option>Tuần này</option>
              <option>Tháng này</option>
              <option>Năm nay</option>
            </select>
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
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-800">100%</span>
              <span className="text-xs font-bold text-slate-400">Tổng cộng</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4">
            {serviceData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index] }}></span>
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
            <button className="text-[var(--color-primary)] font-bold text-sm hover:underline">Xem tất cả</button>
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
                    <th className="px-6 py-4 whitespace-nowrap text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {recentAppointments.map((apt) => (
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
                      <td className="px-6 py-4 text-center">
                        <button className="text-slate-400 hover:text-[var(--color-primary)] transition-colors p-1">
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>
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
