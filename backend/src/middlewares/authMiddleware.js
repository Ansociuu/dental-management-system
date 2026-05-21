const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware xác thực JWT
 * Kiểm tra token trong header Authorization: Bearer <token>
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để truy cập.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại.' });
    }

    if (req.user.status === 'INACTIVE') {
      return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị tạm khóa.' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
};

/**
 * Middleware phân quyền theo vai trò
 * @param  {...string} roles - Danh sách vai trò được phép (VD: 'ADMIN', 'DOCTOR')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Vai trò '${req.user.role}' không có quyền truy cập chức năng này.` });
    }
    next();
  };
};

module.exports = { protect, authorize };
