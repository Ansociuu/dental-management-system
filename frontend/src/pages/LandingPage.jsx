import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Team from '../components/Team';
import Gallery from '../components/Gallery';
import Feedback from '../components/Feedback';
import Offers from '../components/Offers';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookingPromptOpen, setBookingPromptOpen] = useState(false);

  const getBookingPath = () => {
    if (user?.role === 'PATIENT') return '/patient/book';
    if (user?.role === 'RECEPTIONIST') return '/receptionist/appointments/book';
    if (['ADMIN', 'MANAGER'].includes(user?.role)) return '/admin/appointments/book';
    if (user?.role === 'DOCTOR') return '/doctor/dashboard';
    return null;
  };

  const handleBookNow = () => {
    const path = getBookingPath();
    if (path) {
      navigate(path);
      return;
    }
    setBookingPromptOpen(true);
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="app-wrapper">
      <Navbar onBookNow={handleBookNow} />
      <main>
        <Hero onBookNow={handleBookNow} onConsultation={() => scrollToSection('contact')} />
        <About />
        <Services />
        <Team />
        <Gallery />
        <Feedback />
        <Offers onBookNow={handleBookNow} onShowPricing={() => scrollToSection('services')} />
      </main>
      <Footer />

      {bookingPromptOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-white/70 overflow-hidden">
            <div className="p-7">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-[30px]">event_available</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-950">Đặt lịch khám</h2>
              <p className="mt-2 text-sm font-medium text-slate-500 leading-6">
                Bạn cần đăng nhập hoặc tạo tài khoản bệnh nhân để chọn bác sĩ, ca khám và theo dõi lịch hẹn.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-7">
                <Link
                  to="/login"
                  className="px-5 py-3 rounded-2xl bg-blue-600 text-white text-center text-sm font-extrabold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-3 rounded-2xl border border-blue-200 text-blue-700 text-center text-sm font-extrabold hover:bg-blue-50 transition-colors"
                >
                  Đăng ký
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setBookingPromptOpen(false)}
                className="w-full mt-3 px-5 py-3 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Để sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
