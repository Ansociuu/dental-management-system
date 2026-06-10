const User = require('../models/User');
const DoctorSalaryProfile = require('../models/DoctorSalaryProfile');
const Appointment = require('../models/Appointment');
const DutySchedule = require('../models/DutySchedule');
const { recordConfigChange, toPlainObject } = require('../services/configChangeLogService');

const PROTECTED_USER_ROLES = ['ADMIN', 'MANAGER'];
const USER_LOG_FIELDS = [
  'fullName', 'email', 'phone', 'role', 'specialization', 'status',
  'dob', 'gender', 'licenseNumber', 'specialties', 'experience', 'avatar'
];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\d{10}$/;
const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const validateUserInput = ({ fullName, email, phone, password, role, licenseNumber }, { creating = false } = {}) => {
  if (creating && (!fullName || !email || !phone)) {
    const error = new Error('Vui lòng nhập đầy đủ thông tin bắt buộc');
    error.statusCode = 400;
    throw error;
  }
  if (email !== undefined && !EMAIL_PATTERN.test(String(email).trim())) {
    const error = new Error('Email không đúng định dạng');
    error.statusCode = 400;
    throw error;
  }
  if (phone !== undefined && !PHONE_PATTERN.test(String(phone).trim())) {
    const error = new Error('Số điện thoại không đúng định dạng');
    error.statusCode = 400;
    throw error;
  }
  if (password !== undefined && !STRONG_PASSWORD_PATTERN.test(String(password))) {
    const error = new Error('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số');
    error.statusCode = 400;
    throw error;
  }
  if (String(role || '').toUpperCase() === 'DOCTOR' && creating && !String(licenseNumber || '').trim()) {
    const error = new Error('Vui lòng nhập Số chứng chỉ hành nghề');
    error.statusCode = 400;
    throw error;
  }
};

const isManager = (user) => user?.role === 'MANAGER';

const ensureManagerCanManageUser = (actor, targetUser) => {
  if (isManager(actor) && PROTECTED_USER_ROLES.includes(targetUser.role)) {
    const error = new Error('Quan ly khong duoc thao tac voi tai khoan quan tri hoac quan ly khac');
    error.statusCode = 403;
    throw error;
  }
};

const ensureManagerCanSetRole = (actor, role) => {
  const normalizedRole = String(role || '').toUpperCase();
  if (isManager(actor) && PROTECTED_USER_ROLES.includes(normalizedRole)) {
    const error = new Error('Quan ly khong duoc tao hoac gan vai tro quan tri/quan ly');
    error.statusCode = 403;
    throw error;
  }
};

// GET /api/v1/users
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const query = {};

    if (role) {
      query.role = role.toUpperCase();
    } else {
      query.role = { $ne: 'PATIENT' };
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/users
exports.createUser = async (req, res, next) => {
  try {
    const { fullName, email, phone, role, specialization, status, password,
            dob, gender, licenseNumber, specialties, experience, avatar } = req.body;
    const normalizedRole = role ? role.toUpperCase() : 'DOCTOR';
    validateUserInput({ fullName, email, phone, password, role: normalizedRole, licenseNumber }, { creating: true });

    if (normalizedRole === 'PATIENT') {
      return res.status(400).json({ success: false, message: 'Tai khoan benh nhan phai dang ky qua cong benh nhan' });
    }
    ensureManagerCanSetRole(req.user, normalizedRole);
    
    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email đã tồn tại trong hệ thống' });
    }

    // Check if licenseNumber is duplicated (for doctors)
    if (licenseNumber) {
      const licDup = await User.findOne({ licenseNumber });
      if (licDup) {
        return res.status(400).json({ success: false, message: `Số chứng chỉ hành nghề đã tồn tại (${licDup.fullName})` });
      }
    }

    const newUser = await User.create({
      fullName,
      email,
      phone,
      password: password || '123456', // Mật khẩu mặc định
      role: normalizedRole,
      specialization,
      status: status ? status.toUpperCase() : 'ACTIVE',
      dob: dob || undefined,
      gender: gender || '',
      licenseNumber: licenseNumber || '',
      specialties: specialties || [],
      experience: experience || '',
      avatar: avatar || ''
    });

    if (newUser.role === 'DOCTOR') {
      await DoctorSalaryProfile.findOneAndUpdate(
        { doctorId: newUser._id },
        { $setOnInsert: { doctorId: newUser._id, updatedBy: req.user?._id } },
        { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
      );
    }

    await recordConfigChange({
      resourceType: 'USER',
      resourceId: newUser._id,
      resourceName: newUser.fullName,
      action: 'CREATE',
      before: null,
      after: toPlainObject(newUser, USER_LOG_FIELDS),
      user: req.user
    });

    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { fullName, email, phone, role, specialization, status,
            dob, gender, licenseNumber, specialties, experience, avatar } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    ensureManagerCanManageUser(req.user, user);
    validateUserInput({ fullName, email, phone, role, licenseNumber });
    const before = toPlainObject(user, USER_LOG_FIELDS);

    // Check if email belongs to someone else
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
      }
      user.email = email;
    }

    // Check if licenseNumber belongs to someone else
    if (licenseNumber && licenseNumber !== user.licenseNumber) {
      const licDup = await User.findOne({ licenseNumber, _id: { $ne: user._id } });
      if (licDup) {
        return res.status(400).json({ success: false, message: `Số chứng chỉ hành nghề đã tồn tại (${licDup.fullName})` });
      }
    }

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (role) {
      const normalizedRole = role.toUpperCase();
      if (normalizedRole === 'PATIENT' && !user.patientId) {
        return res.status(400).json({ success: false, message: 'Khong the chuyen tai khoan noi bo thanh benh nhan' });
      }
      ensureManagerCanSetRole(req.user, normalizedRole);
      user.role = normalizedRole;
    }
    if (specialization !== undefined) user.specialization = specialization;
    if (status) user.status = status.toUpperCase();
    if (dob !== undefined) user.dob = dob || null;
    if (gender !== undefined) user.gender = gender;
    if (licenseNumber !== undefined) user.licenseNumber = licenseNumber;
    if (specialties !== undefined) user.specialties = specialties;
    if (experience !== undefined) user.experience = experience;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    if (user.role === 'DOCTOR') {
      await DoctorSalaryProfile.findOneAndUpdate(
        { doctorId: user._id },
        { $setOnInsert: { doctorId: user._id, updatedBy: req.user?._id } },
        { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
      );
    }

    await recordConfigChange({
      resourceType: 'USER',
      resourceId: user._id,
      resourceName: user.fullName,
      action: before.status !== user.status && Object.keys(req.body).length === 1 && req.body.status
        ? 'STATUS_CHANGE'
        : 'UPDATE',
      before,
      after: toPlainObject(user, USER_LOG_FIELDS),
      user: req.user
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    ensureManagerCanManageUser(req.user, user);

    const [appointmentCount, dutyCount] = await Promise.all([
      Appointment.countDocuments({ doctorId: user._id }),
      DutySchedule.countDocuments({ doctorId: user._id })
    ]);
    if (appointmentCount > 0 || dutyCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa tài khoản đã phát sinh dữ liệu. Vui lòng khóa tài khoản thay thế!'
      });
    }

    const before = toPlainObject(user, USER_LOG_FIELDS);
    await User.findByIdAndDelete(req.params.id);
    await recordConfigChange({
      resourceType: 'USER',
      resourceId: user._id,
      resourceName: user.fullName,
      action: 'DELETE',
      before,
      after: null,
      user: req.user
    });
    res.json({ success: true, message: 'Đã xóa người dùng thành công' });
  } catch (error) {
    next(error);
  }
};
