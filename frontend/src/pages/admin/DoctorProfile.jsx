import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserById, createUser, updateUser, getUsers } from '../../services/userService';

const DoctorProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [licenseWarning, setLicenseWarning] = useState('');

  const [profile, setProfile] = useState({
    fullName: '',
    dob: '',
    gender: 'Nam',
    phone: '',
    email: '',
    specialties: [],
    licenseNumber: '',
    experience: '',
    avatar: '',
    linkedUserId: '', // for linking to existing user account
  });

  const [newSpecialty, setNewSpecialty] = useState('');
  const [allUsers, setAllUsers] = useState([]);

  // Load user data if editing
  useEffect(() => {
    if (!isNew) {
      const fetchUser = async () => {
        try {
          setLoading(true);
          const res = await getUserById(id);
          const u = res.data;
          setProfile({
            fullName: u.fullName || '',
            dob: u.dob ? new Date(u.dob).toISOString().slice(0, 10) : '',
            gender: u.gender || 'Nam',
            phone: u.phone || '',
            email: u.email || '',
            specialties: u.specialties || [],
            licenseNumber: u.licenseNumber || '',
            experience: u.experience || '',
            avatar: u.avatar || '',
            linkedUserId: u._id || '',
          });
        } catch (err) {
          setError('Không tìm thấy hồ sơ bác sĩ');
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
    // Fetch all doctor users for account linking
    const fetchUsers = async () => {
      try {
        const res = await getUsers({ role: 'DOCTOR' });
        setAllUsers(res.data || []);
      } catch { /* silent */ }
    };
    fetchUsers();
  }, [id, isNew]);

  const handleSubmit = async () => {
    setError(''); setSuccess(''); setSaving(true);
    try {
      const payload = {
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        role: 'DOCTOR',
        dob: profile.dob || null,
        gender: profile.gender,
        licenseNumber: profile.licenseNumber,
        specialties: profile.specialties,
        specialization: profile.specialties.join(', '), // sync legacy field
        experience: profile.experience,
        avatar: profile.avatar,
        status: 'ACTIVE',
      };

      if (isNew) {
        await createUser(payload);
        setSuccess('Tạo hồ sơ bác sĩ mới thành công!');
        setTimeout(() => navigate('/admin/users'), 1500);
      } else {
        await updateUser(id, payload);
        setSuccess('Cập nhật hồ sơ thành công!');
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  const addSpecialty = () => {
    const trimmed = newSpecialty.trim();
    if (trimmed && !profile.specialties.includes(trimmed)) {
      setProfile({ ...profile, specialties: [...profile.specialties, trimmed] });
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index) => {
    setProfile({ ...profile, specialties: profile.specialties.filter((_, i) => i !== index) });
  };

  const handleSpecialtyKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSpecialty();
    }
  };

  // Check license uniqueness
  useEffect(() => {
    if (!profile.licenseNumber) { setLicenseWarning(''); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await getUsers({});
        const dup = (res.data || []).find(u => u.licenseNumber === profile.licenseNumber && u._id !== id);
        if (dup) {
          setLicenseWarning(`Số chứng chỉ này đã tồn tại trong hệ thống (${dup.fullName})`);
        } else {
          setLicenseWarning('');
        }
      } catch { /* silent */ }
    }, 500);
    return () => clearTimeout(timer);
  }, [profile.licenseNumber, id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <span className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></span>
          <p className="text-sm font-medium">Đang tải hồ sơ bác sĩ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold cursor-pointer hover:text-[var(--color-primary)] transition-colors" onClick={() => navigate('/admin/users')}>Quản lý bác sĩ</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[var(--color-primary)] font-semibold">{isNew ? 'Thêm hồ sơ bác sĩ mới' : 'Chỉnh sửa hồ sơ'}</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hồ sơ Bác sĩ</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/users')} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200">
            Hủy bỏ
          </button>
          <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50">
            <span className="material-symbols-outlined text-[18px]">save</span>
            {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </button>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">error</span>{error}</div>}
      {success && <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">check_circle</span>{success}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (Main Info) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Personal Info Block */}
          <div className="bg-white rounded-[1.5rem] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
            <h3 className="flex items-center gap-2 text-lg font-bold text-[#1e3a8a] mb-6">
              <span className="material-symbols-outlined text-[22px]">person</span>
              Thông tin cá nhân (Cơ bản)
            </h3>
            
            {/* Avatar Upload */}
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition-colors overflow-hidden relative group">
                {profile.avatar ? (
                  <>
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-white text-[24px]">edit</span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[32px]">add_a_photo</span>
                    <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">Avatar</span>
                  </>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">Kéo thả ảnh đại diện</p>
                <p className="text-xs text-slate-500 mt-1">JPG, PNG hoặc WebP. Tối đa 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Họ và tên <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={profile.fullName}
                  onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Ngày sinh</label>
                <input 
                  type="date" 
                  value={profile.dob}
                  onChange={(e) => setProfile({...profile, dob: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Giới tính</label>
                <div className="relative">
                  <select 
                    value={profile.gender}
                    onChange={(e) => setProfile({...profile, gender: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none text-slate-700"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Số điện thoại <span className="text-rose-500">*</span></label>
                <input 
                  type="tel" 
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  placeholder="090 123 4567"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Email <span className="text-rose-500">*</span></label>
                <input 
                  type="email" 
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  placeholder="doctor@clinic.com"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Professional Info Block */}
          <div className="bg-white rounded-[1.5rem] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
            <h3 className="flex items-center gap-2 text-lg font-bold text-[#1e3a8a] mb-6">
              <span className="material-symbols-outlined text-[22px]">medical_services</span>
              Thông tin chuyên môn (Nghiệp vụ)
            </h3>
            
            <div className="space-y-6">
              {/* Specialties Tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Chuyên khoa <span className="text-rose-500">*</span></label>
                <div className="flex flex-wrap items-center gap-2 p-3 border border-slate-200 rounded-xl min-h-[48px] bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                  {profile.specialties.map((spec, index) => (
                    <div key={index} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-200 animate-[fadeIn_0.2s_ease-out]">
                      {spec}
                      <button type="button" onClick={() => removeSpecialty(index)} className="hover:text-rose-600 transition-colors">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    onKeyDown={handleSpecialtyKeyDown}
                    placeholder="+ Thêm chuyên khoa"
                    className="flex-1 min-w-[140px] text-sm font-medium outline-none bg-transparent placeholder:text-slate-400"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Nhấn Enter để thêm chuyên khoa mới</p>
              </div>

              {/* License Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Số chứng chỉ hành nghề <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={profile.licenseNumber}
                  onChange={(e) => setProfile({...profile, licenseNumber: e.target.value})}
                  placeholder="VD: CCHN-12345678"
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 transition-all ${
                    licenseWarning 
                      ? 'bg-rose-50/30 border-rose-400 text-rose-700 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'bg-white border-slate-200 text-slate-700 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
                {licenseWarning && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {licenseWarning}
                  </p>
                )}
              </div>

              {/* Experience */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Bằng cấp & Kinh nghiệm</label>
                <textarea 
                  rows="4"
                  value={profile.experience}
                  onChange={(e) => setProfile({...profile, experience: e.target.value})}
                  placeholder="Tóm tắt quá trình đào tạo và công tác..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-slate-600"
                ></textarea>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Attachments & Account) */}
        <div className="space-y-6">
          
          {/* Attachments */}
          <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
            <h3 className="flex items-center gap-2 text-md font-bold text-[#1e3a8a] mb-4">
              <span className="material-symbols-outlined text-[20px]">description</span>
              Tài liệu đính kèm
            </h3>
            
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 transition-all group mb-4">
              <span className="material-symbols-outlined text-[32px] text-slate-400 group-hover:text-blue-500 mb-2 transition-colors">cloud_upload</span>
              <p className="text-sm font-bold text-slate-700 group-hover:text-blue-700">Tải lên bản Scan</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">PDF, JPG (Chứng chỉ, Bằng cấp)</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 group">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-[#1e40af]">description</span>
                  <span className="text-xs font-bold text-slate-700">bang_dai_hoc.pdf</span>
                </div>
                <button className="text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          </div>

          {/* Account Link */}
          <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
            <h3 className="flex items-center gap-2 text-md font-bold text-[#1e3a8a] mb-4">
              <span className="material-symbols-outlined text-[20px]">link</span>
              Liên kết tài khoản
            </h3>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tài khoản người dùng</label>
              <div className="relative">
                <select 
                  value={profile.linkedUserId}
                  onChange={(e) => setProfile({...profile, linkedUserId: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Chọn tài khoản hệ thống...</option>
                  {allUsers.map(u => (
                    <option key={u._id} value={u._id}>{u.fullName} — {u.email}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">account_circle</span>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">expand_more</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">Liên kết này cho phép bác sĩ đăng nhập để quản lý lịch hẹn cá nhân.</p>
            </div>
          </div>

          {/* ID Card Preview */}
          <div className="bg-gradient-to-br from-[#e0e7ff] to-[#c7d2fe] rounded-[1.5rem] p-6 shadow-sm border border-indigo-100 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
              <span className="material-symbols-outlined text-[120px]">badge</span>
            </div>
            <h3 className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider mb-4">Xem trước thẻ</h3>
            <div className="bg-white/60 backdrop-blur-md rounded-xl p-4 flex gap-4 items-center relative z-10">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-12 h-14 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-14 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
              )}
              <div className="space-y-1.5 flex-1 min-w-0">
                <p className="text-sm font-extrabold text-slate-800 truncate">{profile.fullName || 'Họ và tên bác sĩ'}</p>
                <p className="text-[11px] font-medium text-slate-500 truncate">{profile.specialties.join(', ') || 'Chuyên khoa'}</p>
                {profile.licenseNumber && <p className="text-[10px] font-bold text-indigo-600">CCHN: {profile.licenseNumber}</p>}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
