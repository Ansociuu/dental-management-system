const AccessDenied = () => (
  <div className="flex-1 flex items-center justify-center bg-slate-50 p-8">
    <div className="max-w-md text-center bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
      <span className="material-symbols-outlined text-[56px] text-rose-500 mb-4">lock</span>
      <h2 className="text-xl font-extrabold text-slate-900 mb-2">Không có quyền truy cập</h2>
      <p className="text-sm font-medium text-slate-500">
        Tài khoản của bạn chưa được cấp quyền sử dụng chức năng này.
      </p>
    </div>
  </div>
);

export default AccessDenied;
