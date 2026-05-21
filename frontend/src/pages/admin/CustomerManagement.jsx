import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients, createPatient, updatePatient, deletePatient } from '../../services/patientService';

const CustomerManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    dob: '',
    gender: 'Nam',
    address: ''
  });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await getPatients(searchTerm);
      setPatients(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [searchTerm]);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await createPatient(form);
      setSuccess('Thêm khách hàng thành công!');
      setIsAddModalOpen(false);
      setForm({ fullName: '', phone: '', dob: '', gender: 'Nam', address: '' });
      fetchPatients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const calculateAge = (dobString) => {
    if (!dobString) return '—';
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getAvatarLetter = (name) => {
    if (!name) return 'BN';
    return name.split(' ').pop().substring(0, 1).toUpperCase();
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 relative">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold">Người dùng</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[var(--color-primary)] font-semibold">Khách hàng</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quản lý Khách hàng</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Quản lý thông tin, lịch sử khám và hồ sơ bệnh án của bệnh nhân.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] transition-all shadow-lg shadow-blue-900/20 hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Thêm khách hàng
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">{error}</div>}
      {success && <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">{success}</div>}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-[1.5rem] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
          <input 
            type="text" 
            placeholder="Tìm theo tên, SĐT..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Customer Data Table */}
      <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-medium">Đang tải danh sách khách hàng...</div>
          ) : patients.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">person_off</span>
              <p className="text-sm font-bold">Không tìm thấy khách hàng nào</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[35%]">Khách hàng</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thông tin liên hệ</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Giới tính / Tuổi</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Địa chỉ</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-50 text-indigo-700 font-bold flex items-center justify-center shadow-inner border border-indigo-100/50 text-lg">
                          {getAvatarLetter(patient.fullName)}
                        </div>
                        <div>
                          <p 
                            onClick={() => navigate(`/admin/records?id=${patient._id}`)}
                            className="font-bold text-slate-900 group-hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                          >
                            {patient.fullName}
                          </p>
                          <p className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">{patient.patientCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">call</span>
                        {patient.phone}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                        {patient.gender} • {calculateAge(patient.dob)} tuổi
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-500 truncate max-w-[200px]">{patient.address || '—'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigate(`/admin/records?id=${patient._id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors tooltip-trigger relative" 
                          title="Hồ sơ bệnh án"
                        >
                          <span className="material-symbols-outlined text-[20px]">medical_information</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-extrabold text-slate-800">Thêm Khách Hàng Mới</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Họ và tên <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={form.fullName}
                  onChange={e => setForm({...form, fullName: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                  placeholder="VD: Nguyễn Văn A" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Số điện thoại <span className="text-rose-500">*</span></label>
                  <input 
                    type="tel" 
                    required
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                    placeholder="VD: 0912345678" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Ngày sinh <span className="text-rose-500">*</span></label>
                  <input 
                    type="date" 
                    required
                    value={form.dob}
                    onChange={e => setForm({...form, dob: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Giới tính <span className="text-rose-500">*</span></label>
                <select 
                  value={form.gender}
                  onChange={e => setForm({...form, gender: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Địa chỉ</label>
                <input 
                  type="text" 
                  value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                  placeholder="VD: 123 Nguyễn Trãi, Quận 5" 
                />
              </div>
              
              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">Hủy</button>
                <button type="submit" className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
