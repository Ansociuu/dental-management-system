const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'
).replace(/\/$/, '');

/**
 * Base fetch wrapper với xử lý lỗi thống nhất
 * Tự động đính kèm JWT token nếu có trong localStorage
 */
const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('mec_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  // Nếu token hết hạn hoặc không hợp lệ, chuyển về trang đăng nhập
  if (res.status === 401) {
    localStorage.removeItem('mec_token');
    localStorage.removeItem('mec_user');
    // Chỉ redirect nếu không phải đang ở trang login
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  if (!res.ok) throw new Error(data.message || 'Có lỗi xảy ra');
  return data;
};

export default apiFetch;
