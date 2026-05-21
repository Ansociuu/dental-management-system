const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');

// Helper to construct a robust 24-hour date range ignoring timezone shifts
const getDayRange = (dateInput) => {
  const parsed = new Date(dateInput);
  
  const utcStart = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), 0, 0, 0, 0));
  const utcEnd = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), 23, 59, 59, 999));
  
  const localStart = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0, 0);
  const localEnd = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 23, 59, 59, 999);

  const gte = new Date(Math.min(utcStart.getTime(), localStart.getTime()));
  const lte = new Date(Math.max(utcEnd.getTime(), localEnd.getTime()));
  
  return { $gte: gte, $lte: lte };
};

/**
 * @desc    Lấy toàn bộ số liệu thống kê Dashboard
 * @route   GET /api/v1/dashboard/stats
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();

    // 1. Tổng số bệnh nhân
    const totalPatients = await Patient.countDocuments({});

    // 2. Số lượng lịch hẹn hôm nay
    const todayAppointmentsCount = await Appointment.countDocuments({
      date: getDayRange(today)
    });

    // 3. Số lượng đang chờ khám hôm nay (CHECKED_IN)
    const waitingCount = await Appointment.countDocuments({
      date: getDayRange(today),
      status: 'CHECKED_IN'
    });

    // 4. Doanh thu trong ngày (Tổng tiền các ca khám COMPLETED hôm nay)
    const todayCompleted = await Appointment.find({
      date: getDayRange(today),
      status: 'COMPLETED'
    }).populate('serviceId');
    
    const todayRevenue = todayCompleted.reduce((sum, apt) => sum + (apt.serviceId?.price || 0), 0);

    // 5. Danh sách lịch hẹn hôm nay (Recent Table)
    const recentAppointments = await Appointment.find({
      date: getDayRange(today)
    })
      .populate('patientId', 'fullName phone')
      .populate('doctorId', 'fullName')
      .populate('serviceId', 'name price')
      .sort({ queueNumber: 1 })
      .limit(10);

    // Format recent appointments list to match frontend needs
    const formattedRecent = recentAppointments.map(apt => {
      let statusColor = 'slate';
      let statusLabel = 'Đợi duyệt';

      if (apt.status === 'CONFIRMED') {
        statusColor = 'blue';
        statusLabel = 'Đã xác nhận';
      } else if (apt.status === 'CHECKED_IN') {
        statusColor = 'amber';
        statusLabel = 'Chờ khám';
      } else if (apt.status === 'COMPLETED') {
        statusColor = 'emerald';
        statusLabel = 'Đã xong';
      } else if (apt.status === 'CANCELLED') {
        statusColor = 'rose';
        statusLabel = 'Đã hủy';
      }

      return {
        id: apt._id,
        patient: apt.patientId?.fullName || 'Bệnh nhân mẫu',
        time: apt.shiftId ? 'Theo ca' : 'Có hẹn',
        service: apt.serviceId?.name || 'Khám tổng quát',
        doctor: apt.doctorId?.fullName || 'Bác sĩ trực',
        status: statusLabel,
        statusColor
      };
    });

    // 6. Phân bố dịch vụ (Cơ cấu dịch vụ)
    const serviceDistribution = [];
    const appointmentsAll = await Appointment.find({}).populate('serviceId');
    const serviceCounts = {};
    
    appointmentsAll.forEach(apt => {
      if (apt.serviceId) {
        serviceCounts[apt.serviceId.name] = (serviceCounts[apt.serviceId.name] || 0) + 1;
      }
    });

    Object.keys(serviceCounts).forEach(name => {
      serviceDistribution.push({ name, value: serviceCounts[name] });
    });

    // Điền mặc định nếu chưa có lịch khám nào để tránh biểu đồ trống
    if (serviceDistribution.length === 0) {
      serviceDistribution.push({ name: 'Khám tổng quát', value: 1 });
      serviceDistribution.push({ name: 'Nhổ răng khôn', value: 1 });
    }

    res.json({
      success: true,
      data: {
        totalPatients,
        todayAppointmentsCount,
        waitingCount,
        todayRevenue,
        recentAppointments: formattedRecent,
        serviceDistribution: serviceDistribution.slice(0, 5)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
