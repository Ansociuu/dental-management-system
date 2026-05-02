import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: 'Nguyễn Văn A',
    dob: '1985-05-15',
    gender: 'Nam',
    phone: '0901234567',
    email: 'doctor@clinic.com',
    specialties: ['Răng sứ thẩm mỹ', 'Niềng răng - Chỉnh nha'],
    license: 'CCHN-12345678',
    experience: 'Tóm tắt quá trình đào tạo và công tác...'
  });

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold cursor-pointer hover:text-[var(--color-primary)]" onClick={() => navigate('/admin/users')}>Quản lý bác sĩ</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[var(--color-primary)] font-semibold">Thêm hồ sơ bác sĩ mới</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hồ sơ Bác sĩ</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
            Hủy bỏ
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#1e40af] hover:bg-[#1e3a8a] transition-colors shadow-sm">
            Lưu hồ sơ
          </button>
        </div>
      </div>

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
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition-colors">
                <span className="material-symbols-outlined text-[32px]">add_a_photo</span>
                <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">Avatar</span>
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
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Ngày sinh</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={profile.dob}
                    onChange={(e) => setProfile({...profile, dob: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Giới tính</label>
                <div className="relative">
                  <select 
                    value={profile.gender}
                    onChange={(e) => setProfile({...profile, gender: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none text-slate-700"
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
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Email <span className="text-rose-500">*</span></label>
                <input 
                  type="email" 
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Chuyên khoa <span className="text-rose-500">*</span></label>
                <div className="flex flex-wrap items-center gap-2 p-2 border border-slate-200 rounded-lg min-h-[44px]">
                  {profile.specialties.map((spec, index) => (
                    <div key={index} className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md text-xs font-bold">
                      {spec}
                      <span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-blue-800">close</span>
                    </div>
                  ))}
                  <button className="text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors ml-2">
                    + Thêm chuyên khoa
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Số chứng chỉ hành nghề <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={profile.license}
                  onChange={(e) => setProfile({...profile, license: e.target.value})}
                  className="w-full px-4 py-2.5 bg-rose-50/30 border border-rose-400 rounded-lg text-sm font-bold text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
                <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  Số chứng chỉ này đã tồn tại trong hệ thống (BS. Lê Minh Tâm)
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Bằng cấp & Kinh nghiệm</label>
                <textarea 
                  rows="4"
                  value={profile.experience}
                  onChange={(e) => setProfile({...profile, experience: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-slate-500"
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
                <select className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer">
                  <option value="">Chọn tài khoản hệ thống...</option>
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
            <div className="bg-white/60 backdrop-blur-md rounded-xl p-4 flex gap-4 items-center">
              <div className="w-12 h-14 bg-slate-200 rounded-lg"></div>
              <div className="space-y-2 flex-1">
                <div className="h-2.5 bg-slate-300 rounded w-3/4"></div>
                <div className="h-2 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
