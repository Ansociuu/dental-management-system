import React from 'react';

const Offers = () => {
  return (
    <section id="pricing" className="section-padding overflow-hidden relative" style={{ backgroundColor: 'var(--surface-container-highest)' }}>
      {/* Decorative background element - softer contrast */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 skew-x-[-15deg] translate-x-1/3 pointer-events-none"></div>

      <div className="container-max">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10 relative z-10">
            <div className="space-y-4">
              <span className="text-primary font-bold uppercase tracking-widest text-sm">Chương trình ưu đãi</span>
              <h2 className="text-display-lg text-primary">Ưu đãi đặc biệt <br/>trong tháng này</h2>
              <p className="text-on-surface-variant text-lg max-w-md">Đừng bỏ lỡ cơ hội chăm sóc nụ cười với công nghệ hiện đại nhất và chi phí tối ưu.</p>
            </div>

            <div className="space-y-6">
              <div className="bg-primary text-white p-8 rounded-3xl shadow-xl shadow-primary/10 flex items-center justify-between group hover:translate-y-[-4px] transition-all duration-300">
                <div>
                  <h4 className="text-xl font-bold mb-1">Ưu đãi tẩy trắng răng</h4>
                  <p className="text-white/70 text-sm">Áp dụng cho công nghệ Laser hiện đại nhất</p>
                </div>
                <div className="text-4xl font-extrabold bg-white/20 px-4 py-2 rounded-2xl">-20%</div>
              </div>

              <div className="bg-white border border-outline-variant p-8 rounded-3xl shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-300">
                <div>
                  <h4 className="text-xl font-bold mb-1 text-primary">Gói niềng răng trả góp</h4>
                  <p className="text-on-surface-variant text-sm">Lãi suất 0%, chỉ từ 1 triệu đồng / tháng</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-primary">payments</span>
                </div>
              </div>
            </div>

            <button className="btn-secondary px-10 py-4">Xem bảng giá chi tiết</button>
          </div>

          <div id="contact" className="relative z-10">
            <div className="bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl shadow-primary/5 border border-outline-variant">
              <div className="mb-8">
                <h3 className="text-3xl font-bold text-primary mb-2">Đặt lịch hẹn</h3>
                <p className="text-on-surface-variant text-sm">Để lại thông tin, bác sĩ sẽ tư vấn miễn phí cho bạn.</p>
              </div>
              
              <form className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary uppercase tracking-widest ml-1">Họ và tên</label>
                  <input 
                    type="text" 
                    placeholder="Nhập tên của bạn"
                    className="form-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-primary uppercase tracking-widest ml-1">Số điện thoại</label>
                    <input 
                      type="tel" 
                      placeholder="090..."
                      className="form-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-primary uppercase tracking-widest ml-1">Dịch vụ</label>
                    <div className="relative">
                      <select className="form-input appearance-none">
                        <option>Niềng răng</option>
                        <option>Tẩy trắng</option>
                        <option>Implant</option>
                        <option>Tổng quát</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none">expand_more</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary uppercase tracking-widest ml-1">Thời gian dự kiến</label>
                  <input 
                    type="datetime-local" 
                    className="form-input"
                  />
                </div>

                <button className="btn-primary w-full mt-4 py-5 text-lg shadow-xl shadow-primary/20">
                  Gửi yêu cầu đặt hẹn
                </button>
                
                <p className="text-center text-[10px] text-on-surface-variant uppercase tracking-tighter opacity-50">
                  Chúng tôi cam kết bảo mật thông tin khách hàng tuyệt đối
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Offers;
