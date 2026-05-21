const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

/**
 * Sinh mã bệnh nhân tự động: MEC-PT-XXXX
 */
const generatePatientCode = async () => {
  const lastPatient = await Patient.findOne().sort({ createdAt: -1 });
  if (!lastPatient) return 'MEC-PT-0001';
  const lastNum = parseInt(lastPatient.patientCode.split('-')[2], 10);
  return `MEC-PT-${String(lastNum + 1).padStart(4, '0')}`;
};

/**
 * @desc    Thêm bệnh nhân mới
 * @route   POST /api/v1/patients
 */
const createPatient = async (req, res, next) => {
  try {
    const { fullName, phone, dob, gender, address } = req.body;
    const patientCode = await generatePatientCode();
    const patient = await Patient.create({ patientCode, fullName, phone, dob, gender, address });
    res.status(201).json({ success: true, message: 'Thêm bệnh nhân thành công!', data: patient });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lấy danh sách bệnh nhân
 * @route   GET /api/v1/patients
 * @query   search - tìm theo tên hoặc SĐT
 */
const getPatients = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { fullName: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } },
        { patientCode: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    const patients = await Patient.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: patients });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lấy thông tin bệnh nhân theo ID
 * @route   GET /api/v1/patients/:id
 */
const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      const error = new Error('Không tìm thấy bệnh nhân');
      error.statusCode = 404;
      throw error;
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cập nhật thông tin bệnh nhân
 * @route   PUT /api/v1/patients/:id
 */
const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!patient) {
      const error = new Error('Không tìm thấy bệnh nhân');
      error.statusCode = 404;
      throw error;
    }
    res.json({ success: true, message: 'Cập nhật bệnh nhân thành công!', data: patient });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Xóa bệnh nhân (chỉ khi chưa có lịch khám)
 * @route   DELETE /api/v1/patients/:id
 */
const deletePatient = async (req, res, next) => {
  try {
    // Ràng buộc: Không cho xóa nếu bệnh nhân đã có lịch khám
    const hasAppointments = await Appointment.exists({ patientId: req.params.id });
    if (hasAppointments) {
      const error = new Error('Không thể xóa bệnh nhân đã có lịch sử khám. Hãy hủy toàn bộ lịch khám trước.');
      error.statusCode = 400;
      throw error;
    }

    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      const error = new Error('Không tìm thấy bệnh nhân');
      error.statusCode = 404;
      throw error;
    }
    res.json({ success: true, message: 'Xóa bệnh nhân thành công' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPatient, getPatients, getPatientById, updatePatient, deletePatient };
