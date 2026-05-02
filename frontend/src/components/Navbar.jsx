import React, { useState, useEffect } from 'react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md py-3 shadow-md border-b border-gray-100' : 'bg-white py-5 border-b border-transparent'
    }`}>
      <div className="container-max flex items-center justify-between">
        <div className="logo flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">dentistry</span>
          <h1 className="text-xl font-extrabold tracking-tight" style={{ margin: 0 }}>
            Nha khoa <span style={{ color: 'var(--tertiary)' }}>Mec</span>
          </h1>
        </div>
        
        <div className="hidden md:flex items-center gap-10">
          <a href="#services" className="font-semibold text-on-surface-variant hover:text-primary">Dịch vụ</a>
          <a href="#about" className="font-semibold text-on-surface-variant hover:text-primary">Về chúng tôi</a>
          <a href="#doctors" className="font-semibold text-on-surface-variant hover:text-primary">Bác sĩ</a>
          <a href="#pricing" className="font-semibold text-on-surface-variant hover:text-primary">Bảng giá</a>
          <a href="#contact" className="font-semibold text-on-surface-variant hover:text-primary">Liên hệ</a>
        </div>

        <button className="btn-primary" style={{ padding: '10px 24px', borderRadius: 'var(--radius-full)' }}>
          Đặt lịch ngay
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
