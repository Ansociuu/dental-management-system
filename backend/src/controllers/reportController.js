const Appointment = require('../models/Appointment');
const Invoice = require('../models/Invoice');
const Patient = require('../models/Patient');

const getDayRange = (dateInput) => {
  const parsed = new Date(dateInput);

  const utcStart = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), 0, 0, 0, 0));
  const utcEnd = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), 23, 59, 59, 999));

  const localStart = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0, 0);
  const localEnd = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 23, 59, 59, 999);

  return {
    $gte: new Date(Math.min(utcStart.getTime(), localStart.getTime())),
    $lte: new Date(Math.max(utcEnd.getTime(), localEnd.getTime()))
  };
};

const toDateInput = (date) => date.toISOString().slice(0, 10);

const getDateRange = (query) => {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const from = query.dateFrom || toDateInput(monthStart);
  const to = query.dateTo || toDateInput(today);

  return {
    dateFrom: from,
    dateTo: to,
    range: {
      $gte: getDayRange(from).$gte,
      $lte: getDayRange(to).$lte
    }
  };
};

const calculateAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
};

const getAgeGroup = (age) => {
  if (age === null || Number.isNaN(age)) return 'Chua ro';
  if (age < 18) return 'Duoi 18';
  if (age <= 30) return '18 - 30';
  if (age <= 50) return '31 - 50';
  return 'Tren 50';
};

const getDoctorPerformanceReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, range } = getDateRange(req.query);

    const [appointmentsAgg, revenueAgg] = await Promise.all([
      Appointment.aggregate([
        { $match: { date: range } },
        {
          $group: {
            _id: '$doctorId',
            totalAppointments: { $sum: 1 },
            completedAppointments: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
            cancelledAppointments: { $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] } },
            noShowAppointments: { $sum: { $cond: [{ $eq: ['$status', 'NO_SHOW'] }, 1, 0] } }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'doctor'
          }
        },
        { $unwind: '$doctor' }
      ]),
      Invoice.aggregate([
        { $match: { paidAt: range, paymentStatus: 'PAID' } },
        {
          $group: {
            _id: '$doctorId',
            revenue: { $sum: '$totalAmount' },
            invoiceCount: { $sum: 1 }
          }
        }
      ])
    ]);

    const revenueMap = revenueAgg.reduce((acc, item) => {
      acc[item._id.toString()] = item;
      return acc;
    }, {});

    const rows = appointmentsAgg.map((item) => {
      const id = item._id.toString();
      const revenue = revenueMap[id]?.revenue || 0;
      return {
        doctorId: id,
        doctorName: item.doctor.fullName,
        specialization: item.doctor.specialization || '',
        totalAppointments: item.totalAppointments,
        completedAppointments: item.completedAppointments,
        cancelledAppointments: item.cancelledAppointments,
        noShowAppointments: item.noShowAppointments,
        invoiceCount: revenueMap[id]?.invoiceCount || 0,
        revenue,
        averageRevenue: item.completedAppointments ? revenue / item.completedAppointments : 0
      };
    }).sort((a, b) => b.revenue - a.revenue || b.completedAppointments - a.completedAppointments);

    const totals = rows.reduce((acc, row) => {
      acc.totalAppointments += row.totalAppointments;
      acc.completedAppointments += row.completedAppointments;
      acc.cancelledAppointments += row.cancelledAppointments;
      acc.noShowAppointments += row.noShowAppointments;
      acc.revenue += row.revenue;
      acc.invoiceCount += row.invoiceCount;
      return acc;
    }, {
      totalAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      noShowAppointments: 0,
      revenue: 0,
      invoiceCount: 0
    });

    res.json({
      success: true,
      data: {
        dateFrom,
        dateTo,
        totals,
        topByRevenue: rows[0] || null,
        topByCompleted: [...rows].sort((a, b) => b.completedAppointments - a.completedAppointments)[0] || null,
        doctors: rows
      }
    });
  } catch (error) {
    next(error);
  }
};

const getPatientsServicesReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, range } = getDateRange(req.query);

    const [totalPatients, newPatients, patientsInPeriod, servicesAgg] = await Promise.all([
      Patient.countDocuments({}),
      Patient.countDocuments({ createdAt: range }),
      Patient.find({ createdAt: range }).select('dob gender createdAt'),
      Invoice.aggregate([
        { $match: { paidAt: range, paymentStatus: 'PAID' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            serviceId: { $first: '$items.serviceId' },
            count: { $sum: '$items.quantity' },
            revenue: { $sum: '$items.lineTotal' },
            invoiceCount: { $sum: 1 }
          }
        },
        { $sort: { revenue: -1, count: -1 } }
      ])
    ]);

    const ageGroups = patientsInPeriod.reduce((acc, patient) => {
      const group = getAgeGroup(calculateAge(patient.dob));
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {});

    const genderGroups = patientsInPeriod.reduce((acc, patient) => {
      const gender = patient.gender || 'Chua ro';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    const services = servicesAgg.map((item) => ({
      serviceId: item.serviceId,
      name: item._id || 'Dich vu',
      count: item.count,
      revenue: item.revenue,
      invoiceCount: item.invoiceCount
    }));

    const totalServiceRevenue = services.reduce((sum, service) => sum + service.revenue, 0);
    const totalServiceCount = services.reduce((sum, service) => sum + service.count, 0);

    res.json({
      success: true,
      data: {
        dateFrom,
        dateTo,
        totals: {
          totalPatients,
          newPatients,
          patientSampleCount: patientsInPeriod.length,
          serviceRevenue: totalServiceRevenue,
          serviceCount: totalServiceCount
        },
        ageGroups: Object.entries(ageGroups).map(([name, value]) => ({ name, value })),
        genderGroups: Object.entries(genderGroups).map(([name, value]) => ({ name, value })),
        services
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctorPerformanceReport,
  getPatientsServicesReport
};
