import React from 'react';

const Footer = () => {
  return (
    <footer className="pt-20 pb-10" style={{ backgroundColor: 'var(--surface-container-low)', borderTop: '1px solid var(--outline-variant)' }}>
      <div className="container-max">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <div className="logo flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl">dentistry</span>
              <h2 className="text-xl font-extrabold tracking-tight" style={{ margin: 0 }}>
                Nha khoa <span style={{ color: 'var(--tertiary)' }}>Mec</span>
              </h2>
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Chuỗi hệ thống nha khoa thẩm mỹ uy tín hàng đầu, mang lại vẻ đẹp rạng rỡ và sự tự tin cho hàng triệu người Việt qua mỗi nụ cười.
            </p>
          </div>

          <div>
            <h4 className="text-primary font-bold mb-8">Về chúng tôi</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-on-surface-variant text-sm hover:text-primary hover:underline">Giới thiệu</a></li>
              <li><a href="#doctors" className="text-on-surface-variant text-sm hover:text-primary hover:underline">Đội ngũ bác sĩ</a></li>
              <li><a href="#" className="text-on-surface-variant text-sm hover:text-primary hover:underline">Cơ sở vật chất</a></li>
              <li><a href="#" className="text-on-surface-variant text-sm hover:text-primary hover:underline">Câu hỏi thường gặp</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-primary font-bold mb-8">Dịch vụ</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-on-surface-variant text-sm hover:text-primary hover:underline">Răng sứ thẩm mỹ</a></li>
              <li><a href="#" className="text-on-surface-variant text-sm hover:text-primary hover:underline">Chỉnh nha Invisalign</a></li>
              <li><a href="#" className="text-on-surface-variant text-sm hover:text-primary hover:underline">Cấy ghép Implant</a></li>
              <li><a href="#" className="text-on-surface-variant text-sm hover:text-primary hover:underline">Tẩy trắng răng</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-primary font-bold mb-8">Liên hệ</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary">location_on</span>
                <p className="text-on-surface-variant text-sm">Phenikaa</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary">call</span>
                <p className="text-on-surface-variant text-sm">1900 1234</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary">mail</span>
                <p className="text-on-surface-variant text-sm">info@nhakhoamec.vn</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-semibold text-on-surface-variant opacity-60">
            © 2026 Nha khoa Mec. Bảo tồn nụ cười Việt.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-xs font-semibold text-on-surface-variant hover:text-primary underline opacity-60">Chính sách bảo mật</a>
            <a href="#" className="text-xs font-semibold text-on-surface-variant hover:text-primary underline opacity-60">Điều khoản sử dụng</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
