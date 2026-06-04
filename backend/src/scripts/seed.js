/**
 * Script nạp dữ liệu mẫu (Seed Data)
 * Chạy: npm run seed
 * 
 * Tạo dữ liệu mẫu ngẫu nhiên cho: Users (Bác sĩ), Services, Shifts, Patients, DutySchedules
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Service = require('../models/Service');
const Shift = require('../models/Shift');
const Patient = require('../models/Patient');
const Holiday = require('../models/Holiday');
const DutySchedule = require('../models/DutySchedule');
const SalarySetting = require('../models/SalarySetting');
const DoctorSalaryProfile = require('../models/DoctorSalaryProfile');
const ShiftSalaryRule = require('../models/ShiftSalaryRule');
const AppointmentComplexity = require('../models/AppointmentComplexity');
const SalaryPayslip = require('../models/SalaryPayslip');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công để seed dữ liệu...');

    // Xóa dữ liệu cũ
    await User.deleteMany({});
    await Service.deleteMany({});
    await Shift.deleteMany({});
    await Patient.deleteMany({});
    await Holiday.deleteMany({});
    await DutySchedule.deleteMany({});
    await SalarySetting.deleteMany({});
    await DoctorSalaryProfile.deleteMany({});
    await ShiftSalaryRule.deleteMany({});
    await AppointmentComplexity.deleteMany({});
    await SalaryPayslip.deleteMany({});
    console.log('🗑️  Đã xóa dữ liệu cũ');

    // 1. Tạo Users (Bác sĩ & Nhân viên)
    const defaultPassword = '123456';
    const users = await User.create([
      { fullName: 'BS. Nguyễn Hoàng Minh', email: 'minh.nguyen@mec.vn', phone: '0901234567', password: defaultPassword, role: 'DOCTOR', specialization: 'Implant & Phục hình', status: 'ACTIVE' },
      { fullName: 'BS. Trần Thị Thanh Hương', email: 'huong.tran@mec.vn', phone: '0912345678', password: defaultPassword, role: 'DOCTOR', specialization: 'Chỉnh nha - Niềng răng', status: 'ACTIVE' },
      { fullName: 'BS. Lê Minh Tâm', email: 'tam.le@mec.vn', phone: '0923456789', password: defaultPassword, role: 'DOCTOR', specialization: 'Nhổ răng khôn & Tiểu phẫu', status: 'ACTIVE' },
      { fullName: 'BS. Phạm Văn Đức', email: 'duc.pham@mec.vn', phone: '0934567890', password: defaultPassword, role: 'DOCTOR', specialization: 'Răng sứ thẩm mỹ', status: 'ACTIVE' },
      { fullName: 'BS. Hoàng Thị Mai', email: 'mai.hoang@mec.vn', phone: '0945678901', password: defaultPassword, role: 'DOCTOR', specialization: 'Nha khoa trẻ em', status: 'ACTIVE' },
      { fullName: 'Nguyễn Thị Lan', email: 'lan.nguyen@mec.vn', phone: '0956789012', password: defaultPassword, role: 'RECEPTIONIST', status: 'ACTIVE' },
      { fullName: 'Lê Thanh Quản (Manager)', email: 'manager@mec.vn', phone: '0978901234', password: defaultPassword, role: 'MANAGER', status: 'ACTIVE' },
      { fullName: 'Trần Văn Bình (Admin)', email: 'admin@mec.vn', phone: '0967890123', password: defaultPassword, role: 'ADMIN', status: 'ACTIVE' },
    ]);
    console.log(`👨‍⚕️ Đã tạo ${users.length} tài khoản (${users.filter(u => u.role === 'DOCTOR').length} Bác sĩ)`);
    console.log(`🔑 Mật khẩu mặc định cho tất cả: ${defaultPassword}`);

    const doctorsList = users.filter(u => u.role === 'DOCTOR');
    await SalarySetting.create({ key: 'BASE_RATE', baseHourlyRate: 210000 });
    const degreeSamples = [
      { degreeLevel: 'DOCTORATE', doctorCoefficient: 2.0 },
      { degreeLevel: 'MASTER', doctorCoefficient: 1.5 },
      { degreeLevel: 'UNIVERSITY', doctorCoefficient: 1.2 },
      { degreeLevel: 'ASSOCIATE_PROFESSOR', doctorCoefficient: 2.5 },
      { degreeLevel: 'PROFESSOR', doctorCoefficient: 3.0 }
    ];
    await DoctorSalaryProfile.create(doctorsList.map((doctor, index) => ({
      doctorId: doctor._id,
      ...degreeSamples[index % degreeSamples.length]
    })));
    console.log(`💰 Đã tạo cấu hình lương mặc định cho ${doctorsList.length} Bác sĩ`);

    // 2. Tạo Services (Dịch vụ nha khoa)
    const services = await Service.create([
      { name: 'Khám tổng quát', description: 'Kiểm tra sức khỏe răng miệng toàn diện', price: 200000, duration: 30 },
      { name: 'Nhổ răng khôn', description: 'Tiểu phẫu nhổ răng khôn mọc lệch', price: 1500000, duration: 60 },
      { name: 'Tẩy trắng răng', description: 'Tẩy trắng răng bằng công nghệ Laser', price: 3000000, duration: 45 },
      { name: 'Niềng răng mắc cài', description: 'Chỉnh nha bằng mắc cài kim loại/sứ', price: 35000000, duration: 60 },
      { name: 'Niềng răng trong suốt', description: 'Chỉnh nha bằng khay trong suốt Invisalign', price: 65000000, duration: 45 },
      { name: 'Trồng răng Implant', description: 'Cấy ghép Implant Titanium phục hồi răng mất', price: 15000000, duration: 90 },
      { name: 'Bọc răng sứ', description: 'Phục hình thẩm mỹ bằng răng sứ cao cấp', price: 4000000, duration: 60 },
      { name: 'Trám răng thẩm mỹ', description: 'Trám răng bằng Composite thẩm mỹ', price: 500000, duration: 30 },
      { name: 'Lấy cao răng', description: 'Làm sạch cao răng và đánh bóng', price: 300000, duration: 30 },
      { name: 'Điều trị tủy răng', description: 'Chữa viêm tủy, lấy tủy răng', price: 2000000, duration: 60 },
    ]);
    console.log(`🦷 Đã tạo ${services.length} dịch vụ nha khoa`);

    // 3. Tạo Shifts (Ca làm việc)
    const shifts = await Shift.create([
      { name: 'Ca Sáng', startTime: '08:00', endTime: '12:00', maxPatients: 15, status: 'ACTIVE' },
      { name: 'Ca Chiều', startTime: '13:30', endTime: '17:30', maxPatients: 12, status: 'ACTIVE' },
      { name: 'Ca Tối', startTime: '18:00', endTime: '21:00', maxPatients: 8, status: 'ACTIVE' },
    ]);
    console.log(`⏰ Đã tạo ${shifts.length} ca làm việc`);

    const dayTypeDayOfWeek = {
      WEEKDAY_OFFICE: -1,
      WEEKDAY_AFTER_HOURS: -2,
      SATURDAY: 6,
      SUNDAY: 0,
      HOLIDAY: -3
    };
    const shiftByName = new Map(shifts.map((shift) => [shift.name, shift]));
    const defaultShiftSalaryRules = [
      { dayType: 'WEEKDAY_OFFICE', shiftName: 'Ca Sáng', shiftCoefficient: 1.0 },
      { dayType: 'WEEKDAY_OFFICE', shiftName: 'Ca Chiều', shiftCoefficient: 1.0 },
      { dayType: 'WEEKDAY_AFTER_HOURS', shiftName: 'Ca Tối', shiftCoefficient: 1.2 },
      { dayType: 'SATURDAY', shiftName: 'Ca Sáng', shiftCoefficient: 1.3 },
      { dayType: 'SATURDAY', shiftName: 'Ca Chiều', shiftCoefficient: 1.3 },
      { dayType: 'SATURDAY', shiftName: 'Ca Tối', shiftCoefficient: 1.5 },
      { dayType: 'SUNDAY', shiftName: 'Ca Sáng', shiftCoefficient: 1.3 },
      { dayType: 'SUNDAY', shiftName: 'Ca Chiều', shiftCoefficient: 1.3 },
      { dayType: 'SUNDAY', shiftName: 'Ca Tối', shiftCoefficient: 1.5 },
      { dayType: 'HOLIDAY', shiftName: 'Ca Sáng', shiftCoefficient: 2.0 },
      { dayType: 'HOLIDAY', shiftName: 'Ca Chiều', shiftCoefficient: 2.0 },
      { dayType: 'HOLIDAY', shiftName: 'Ca Tối', shiftCoefficient: 2.0 }
    ];
    await ShiftSalaryRule.create(defaultShiftSalaryRules.map((rule) => ({
      shiftId: shiftByName.get(rule.shiftName)._id,
      dayType: rule.dayType,
      dayOfWeek: dayTypeDayOfWeek[rule.dayType],
      shiftCoefficient: rule.shiftCoefficient,
      status: 'ACTIVE'
    })));
    console.log(`💵 Đã tạo ${defaultShiftSalaryRules.length} hệ số ca làm việc mẫu`);

    // 4. Tạo Patients (Bệnh nhân mẫu)
    const patients = await Patient.create([
      { patientCode: 'MEC-PT-0001', fullName: 'Trần Thị Thu Thảo', phone: '0987654321', dob: new Date('1995-03-15'), gender: 'Nữ', address: '123 Nguyễn Huệ, Q.1, TP.HCM' },
      { patientCode: 'MEC-PT-0002', fullName: 'Lê Hoàng Minh', phone: '0976543210', dob: new Date('1988-07-22'), gender: 'Nam', address: '456 Lê Lợi, Q.3, TP.HCM' },
      { patientCode: 'MEC-PT-0003', fullName: 'Phạm Văn Hùng', phone: '0965432109', dob: new Date('1990-11-08'), gender: 'Nam', address: '789 Trần Hưng Đạo, Q.5, TP.HCM' },
      { patientCode: 'MEC-PT-0004', fullName: 'Nguyễn Bích Ngọc', phone: '0954321098', dob: new Date('2000-01-20'), gender: 'Nữ', address: '321 Cách Mạng Tháng 8, Q.10, TP.HCM' },
      { patientCode: 'MEC-PT-0005', fullName: 'Đặng Thái Sơn', phone: '0943210987', dob: new Date('1985-05-30'), gender: 'Nam', address: '654 Võ Văn Tần, Q.3, TP.HCM' },
      { patientCode: 'MEC-PT-0006', fullName: 'Vũ Thị Hồng Nhung', phone: '0932109876', dob: new Date('1998-09-12'), gender: 'Nữ', address: '987 Nguyễn Trãi, Q.5, TP.HCM' },
      { patientCode: 'MEC-PT-0007', fullName: 'Bùi Quốc Anh', phone: '0921098765', dob: new Date('1992-12-05'), gender: 'Nam', address: '147 Hai Bà Trưng, Q.1, TP.HCM' },
      { patientCode: 'MEC-PT-0008', fullName: 'Hồ Thị Mỹ Linh', phone: '0910987654', dob: new Date('2002-06-18'), gender: 'Nữ', address: '258 Điện Biên Phủ, Bình Thạnh, TP.HCM' },
    ]);
    console.log(`🧑‍🤝‍🧑 Đã tạo ${patients.length} bệnh nhân mẫu`);

    // 5. Tạo Holiday mẫu
    const holidays = await Holiday.create([
      { name: 'Nghỉ Quốc khánh 2/9', startDate: new Date('2026-09-02'), endDate: new Date('2026-09-03'), holidayType: 'LE', status: 'ACTIVE', notes: 'Ngày lễ Quốc khánh' },
      { name: 'Nghỉ bảo trì thiết bị', startDate: new Date('2026-06-15'), endDate: new Date('2026-06-15'), holidayType: 'TOAN_PHONG_KHAM', status: 'ACTIVE', notes: 'Bảo trì thiết bị y tế định kỳ' },
    ]);
    console.log(`🏖️  Đã tạo ${holidays.length} ngày nghỉ mẫu`);

    // 6. Tự động phân lịch trực Bác sĩ cho 30 ngày tiếp theo để dễ dàng kiểm thử đặt lịch
    const dutySchedulesData = [];

    // Tạo lịch trực từ hôm nay đến 30 ngày sau
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dayOffset);
      // Đặt giờ về 0 để đồng bộ ngày khám
      targetDate.setHours(0, 0, 0, 0);

      // Cho mỗi ca làm việc, phân ngẫu nhiên 2 bác sĩ trực
      shifts.forEach(shift => {
        // Trộn ngẫu nhiên danh sách bác sĩ
        const shuffledDocs = [...doctorsList].sort(() => 0.5 - Math.random());
        const selectedDocsForShift = shuffledDocs.slice(0, 2); // Chọn 2 bác sĩ cho ca này

        selectedDocsForShift.forEach(doctor => {
          dutySchedulesData.push({
            doctorId: doctor._id,
            date: targetDate,
            shiftId: shift._id,
            status: 'ACTIVE'
          });
        });
      });
    }

    const dutySchedules = await DutySchedule.create(dutySchedulesData);
    console.log(`📅 Đã phân ${dutySchedules.length} lượt trực cho các Bác sĩ trong 30 ngày tới`);

    console.log('\n🎉 ===== SEED DATA HOÀN TẤT =====');
    console.log(`📊 Tổng kết:`);
    console.log(`   - ${users.length} Users (Bác sĩ & Nhân viên)`);
    console.log(`   - ${services.length} Dịch vụ nha khoa`);
    console.log(`   - ${shifts.length} Ca làm việc`);
    console.log(`   - ${patients.length} Bệnh nhân`);
    console.log(`   - ${holidays.length} Ngày nghỉ`);
    console.log(`   - ${dutySchedules.length} Lượt phân lịch trực bác sĩ`);

    await mongoose.connection.close();
    console.log('\n🔌 Đã đóng kết nối MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error.message);
    process.exit(1);
  }
};

seedData();
