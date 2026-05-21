const User = require('../models/User');

// GET /api/v1/users
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const query = {};

    if (role) {
      query.role = role.toUpperCase();
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

// POST /api/v1/users
exports.createUser = async (req, res, next) => {
  try {
    const { fullName, email, phone, role, specialization, status, password } = req.body;
    
    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email đã tồn tại trong hệ thống' });
    }

    const newUser = await User.create({
      fullName,
      email,
      phone,
      password: password || '123456', // Mật khẩu mặc định
      role: role ? role.toUpperCase() : 'DOCTOR',
      specialization,
      status: status ? status.toUpperCase() : 'ACTIVE'
    });

    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { fullName, email, phone, role, specialization, status } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    // Check if email belongs to someone else
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
      }
      user.email = email;
    }

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (role) user.role = role.toUpperCase();
    if (specialization !== undefined) user.specialization = specialization;
    if (status) user.status = status.toUpperCase();

    await user.save();
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

    // Optional: Check if doctor has duty schedules or appointments before deleting
    // For simplicity, we allow deleting but can check if needed.
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa người dùng thành công' });
  } catch (error) {
    next(error);
  }
};
