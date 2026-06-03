const User = require('../models/User');
const DoctorSalaryProfile = require('../models/DoctorSalaryProfile');

const PROTECTED_USER_ROLES = ['ADMIN', 'MANAGER'];

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
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    }

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
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    }

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

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa người dùng thành công' });
  } catch (error) {
    next(error);
  }
};
