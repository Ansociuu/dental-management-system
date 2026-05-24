import React, { useEffect, useState } from 'react';
import { updateMyDoctorProfile } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const DoctorProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    fullName: '',
    dob: '',
    gender: 'Nam',
    phone: '',
    email: '',
    avatar: '',
    specialties: [],
    licenseNumber: '',
    experience: '',
  });
  const [newSpecialty, setNewSpecialty] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) return;
    setProfile({
      fullName: user.fullName || '',
      dob: user.dob ? new Date(user.dob).toISOString().slice(0, 10) : '',
      gender: user.gender || 'Nam',
      phone: user.phone || '',
      email: user.email || '',
      avatar: user.avatar || '',
      specialties: user.specialties || (user.specialization ? user.specialization.split(',').map(s => s.trim()).filter(Boolean) : []),
      licenseNumber: user.licenseNumber || '',
      experience: user.experience || '',
    });
  }, [user]);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const addSpecialty = () => {
    const trimmed = newSpecialty.trim();
    if (trimmed && !profile.specialties.includes(trimmed)) {
      setProfile(prev => ({ ...prev, specialties: [...prev.specialties, trimmed] }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index) => {
    setProfile(prev => ({ ...prev, specialties: prev.specialties.filter((_, i) => i !== index) }));
  };

  const handleSpecialtyKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSpecialty();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const payload = {
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        dob: profile.dob || null,
        gender: profile.gender,
        avatar: profile.avatar,
        specialties: profile.specialties,
        licenseNumber: profile.licenseNumber,
        experience: profile.experience,
      };
      const res = await updateMyDoctorProfile(payload);
      updateUser(res.data);
      setSuccess(res.message || 'Cập nhật hồ sơ bác sĩ thành công!');
    } catch (err) {
      setError(err.message || 'Không thể cập nhật hồ sơ bác sĩ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span className="text-gray-900 font-semibold">Doctor Portal</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-teal-600 font-semibold">Hồ sơ bác sĩ</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hồ sơ Bác sĩ</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Cập nhật thông tin cá nhân và chuyên môn của bạn</p>
          </div>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-slate-950 bg-teal-500 hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/10 disabled:opacity-50">
            <span className="material-symbols-outlined text-[18px]">save</span>
            {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">error</span>{error}</div>}
        {success && <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">check_circle</span>{success}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <section className="bg-white rounded-[1.5rem] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <h2 className="flex items-center gap-2 text-lg font-bold text-teal-800 mb-6">
                <span className="material-symbols-outlined text-[22px]">person</span>
                Thông tin cá nhân
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Họ và tên <span className="text-rose-500">*</span></label>
                  <input required type="text" value={profile.fullName} onChange={(e) => handleChange('fullName', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Ngày sinh</label>
                  <input type="date" value={profile.dob} onChange={(e) => handleChange('dob', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-700" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Giới tính</label>
                  <div className="relative">
                    <select value={profile.gender} onChange={(e) => handleChange('gender', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all appearance-none text-slate-700">
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">expand_more</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Số điện thoại <span className="text-rose-500">*</span></label>
                  <input required type="tel" value={profile.phone} onChange={(e) => handleChange('phone', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-600">Email <span className="text-rose-500">*</span></label>
                  <input required type="email" value={profile.email} onChange={(e) => handleChange('email', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[1.5rem] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <h2 className="flex items-center gap-2 text-lg font-bold text-teal-800 mb-6">
                <span className="material-symbols-outlined text-[22px]">medical_services</span>
                Thông tin chuyên môn
              </h2>

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Chuyên khoa</label>
                  <div className="flex flex-wrap items-center gap-2 p-3 border border-slate-200 rounded-xl min-h-[48px] bg-white focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
                    {profile.specialties.map((spec, index) => (
                      <div key={spec} className="flex items-center gap-1.5 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-teal-200">
                        {spec}
                        <button type="button" onClick={() => removeSpecialty(index)} className="hover:text-rose-600 transition-colors">
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    ))}
                    <input type="text" value={newSpecialty} onChange={(e) => setNewSpecialty(e.target.value)} onKeyDown={handleSpecialtyKeyDown} placeholder="+ Thêm chuyên khoa" className="flex-1 min-w-[140px] text-sm font-medium outline-none bg-transparent placeholder:text-slate-400" />
                    <button type="button" onClick={addSpecialty} className="w-8 h-8 rounded-lg flex items-center justify-center text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200">
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Nhấn Enter hoặc nút + để thêm chuyên khoa mới</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Số chứng chỉ hành nghề</label>
                  <input type="text" value={profile.licenseNumber} onChange={(e) => handleChange('licenseNumber', e.target.value)} placeholder="VD: CCHN-12345678" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Bằng cấp & Kinh nghiệm</label>
                  <textarea rows="5" value={profile.experience} onChange={(e) => handleChange('experience', e.target.value)} placeholder="Tóm tắt quá trình đào tạo và công tác..." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none text-slate-600" />
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <h2 className="flex items-center gap-2 text-md font-bold text-teal-800 mb-4">
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                Ảnh đại diện
              </h2>
              <div className="flex items-center gap-4 mb-4">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover border border-slate-200" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-[32px]">person</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-700">URL ảnh đại diện</p>
                  <p className="text-xs text-slate-400 mt-1">Dán đường dẫn ảnh JPG, PNG hoặc WebP</p>
                </div>
              </div>
              <input type="url" value={profile.avatar} onChange={(e) => handleChange('avatar', e.target.value)} placeholder="https://..." className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
            </section>

            <section className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-[1.5rem] p-6 shadow-sm border border-teal-100 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
                <span className="material-symbols-outlined text-[120px]">badge</span>
              </div>
              <h2 className="text-[10px] font-bold text-teal-800 uppercase tracking-wider mb-4">Xem trước hồ sơ</h2>
              <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 flex gap-4 items-center relative z-10">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Avatar preview" className="w-12 h-14 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-14 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </div>
                )}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-slate-800 truncate">{profile.fullName || 'Họ và tên bác sĩ'}</p>
                  <p className="text-[11px] font-medium text-slate-500 truncate">{profile.specialties.join(', ') || 'Chuyên khoa'}</p>
                  {profile.licenseNumber && <p className="text-[10px] font-bold text-teal-700">CCHN: {profile.licenseNumber}</p>}
                </div>
              </div>
            </section>
          </aside>
        </div>
      </form>
    </div>
  );
};

export default DoctorProfile;
