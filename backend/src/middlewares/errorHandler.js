/**
 * Middleware xử lý lỗi tập trung
 * Bắt tất cả lỗi từ controllers và trả về response JSON thống nhất
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi máy chủ nội bộ';

  // Lỗi Mongoose Validation
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map(e => e.message);
    message = messages.join('. ');
  }

  // Lỗi Mongoose Duplicate Key (trùng dữ liệu unique)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue).join(', ');
    message = `Dữ liệu đã tồn tại cho trường: ${field}`;
  }

  // Lỗi Mongoose CastError (ObjectId không hợp lệ)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Giá trị không hợp lệ cho trường: ${err.path}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
