import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ onBookNow }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <div className="container-max flex items-center justify-between relative">
        <div className="logo flex items-center gap-2 z-50 relative">
          <span className="material-symbols-outlined text-primary text-3xl">dentistry</span>
          <h1 className="text-xl font-extrabold tracking-tight" style={{ margin: 0 }}>
            Nha khoa <span style={{ color: 'var(--tertiary)' }}>Mec</span>
          </h1>
        </div>
        
        <div className="hidden lg:flex items-center justify-center gap-8 flex-1">
          <a href="#services" className="font-semibold text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">Dịch vụ</a>
          <a href="#about" className="font-semibold text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">Về chúng tôi</a>
          <a href="#doctors" className="font-semibold text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">Bác sĩ</a>
          <a href="#pricing" className="font-semibold text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">Bảng giá</a>
          <a href="#contact" className="font-semibold text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">Liên hệ</a>
        </div>

        <div className="flex items-center gap-4 z-50 relative">
          <Link to="/login" className="font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-container)] hidden sm:block transition-colors">Đăng nhập</Link>
          <Link to="/register" className="border-[1.5px] border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white px-5 py-2.5 rounded-full font-bold transition-all hidden md:block">Đăng ký</Link>
          <button
            type="button"
            onClick={onBookNow}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-[var(--color-primary)]/30 transition-all hover:-translate-y-0.5 active:scale-95 hidden sm:block"
          >
            Đặt lịch ngay
          </button>
          
          {/* Mobile menu toggle */}
          <button 
            className="lg:hidden p-2 text-[var(--color-primary)] hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`lg:hidden absolute top-full left-0 w-full bg-white shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen ? 'max-h-screen border-t border-gray-100 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col p-4 gap-2 bg-white">
          <a href="#services" className="font-semibold text-on-surface-variant p-3 hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Dịch vụ</a>
          <a href="#about" className="font-semibold text-on-surface-variant p-3 hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Về chúng tôi</a>
          <a href="#doctors" className="font-semibold text-on-surface-variant p-3 hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Bác sĩ</a>
          <a href="#pricing" className="font-semibold text-on-surface-variant p-3 hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Bảng giá</a>
          <a href="#contact" className="font-semibold text-on-surface-variant p-3 hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Liên hệ</a>
          
          <div className="h-[1px] w-full bg-gray-100 my-2"></div>
          
          <div className="flex flex-col gap-3 sm:hidden pb-4">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onBookNow?.();
              }}
              className="font-semibold text-white bg-[var(--color-tertiary)] text-center p-3 rounded-xl shadow-lg shadow-[var(--color-tertiary)]/20 active:scale-95 transition-transform"
            >
              Đặt lịch ngay
            </button>
            <Link to="/login" className="font-semibold text-primary text-center p-3 border border-primary rounded-xl active:scale-95 transition-transform" onClick={() => setIsMobileMenuOpen(false)}>Đăng nhập</Link>
            <Link to="/register" className="font-semibold text-white bg-primary text-center p-3 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform" onClick={() => setIsMobileMenuOpen(false)}>Đăng ký</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
