const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getPermissionsForRole } = require('../services/permissionService');

// Tạo JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// POST /api/v1/auth/register
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email đã được đăng ký trong hệ thống' });
    }

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role: 'RECEPTIONIST'
    });

    const token = generateToken(user._id);
    const permissions = await getPermissionsForRole(user.role);

    res.status(201).json({
      success: true,
      token,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        permissions,
        specialization: user.specialization,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
    }

    // Tìm user kèm password (vì select: false)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    if (user.status === 'INACTIVE') {
      return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị tạm khóa. Liên hệ quản trị viên.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    const token = generateToken(user._id);
    const permissions = await getPermissionsForRole(user.role);

    res.json({
      success: true,
      token,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        permissions,
        specialization: user.specialization,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const userObject = user.toObject();
    userObject.permissions = await getPermissionsForRole(user.role);
    res.json({ success: true, data: userObject });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/auth/me/profile
exports.updateMyDoctorProfile = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      dob,
      gender,
      avatar,
      specialties,
      licenseNumber,
      experience
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    if (user.role !== 'DOCTOR') {
      return res.status(403).json({ success: false, message: 'Chỉ bác sĩ mới được cập nhật hồ sơ bác sĩ của chính mình' });
    }

    if (fullName !== undefined && !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Họ và tên là bắt buộc' });
    }

    if (email !== undefined && !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email là bắt buộc' });
    }

    if (phone !== undefined && !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Số điện thoại là bắt buộc' });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ email, _id: { $ne: user._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
      }
    }

    if (licenseNumber && licenseNumber !== user.licenseNumber) {
      const licDup = await User.findOne({ licenseNumber, _id: { $ne: user._id } });
      if (licDup) {
        return res.status(400).json({ success: false, message: `Số chứng chỉ hành nghề đã tồn tại (${licDup.fullName})` });
      }
    }

    if (fullName !== undefined) user.fullName = fullName.trim();
    if (email !== undefined) user.email = email.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (dob !== undefined) user.dob = dob || null;
    if (gender !== undefined) user.gender = gender;
    if (avatar !== undefined) user.avatar = avatar;
    if (licenseNumber !== undefined) user.licenseNumber = licenseNumber;
    if (experience !== undefined) user.experience = experience;
    if (specialties !== undefined) {
      user.specialties = Array.isArray(specialties)
        ? specialties.map(item => String(item).trim()).filter(Boolean)
        : [];
      user.specialization = user.specialties.join(', ');
    }

    await user.save();
    res.json({ success: true, message: 'Cập nhật hồ sơ bác sĩ thành công!', data: user });
  } catch (error) {
    next(error);
  }
};
