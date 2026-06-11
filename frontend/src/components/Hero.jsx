import heroImg from '../assets/landingpage/herosecs.png';

const Hero = ({ onBookNow, onConsultation }) => {
  return (
    <section className="relative min-h-screen flex items-center pt-24 overflow-hidden bg-[#f7f9fb]">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImg} 
          alt="Mec Dental Hero" 
          className="w-full h-full object-cover object-center lg:object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent lg:w-2/3"></div>
      </div>

      <div className="container-max relative z-10 w-full">
        <div className="max-w-2xl space-y-8 glass-card p-8 lg:p-12 rounded-[2rem] animate-[fadeInUp_1s_ease-out]">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-secondary-container)] text-[var(--color-tertiary-container)] font-bold text-sm tracking-wide shadow-sm">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            Chuẩn mực Nha khoa quốc tế
          </div>
          
          <h1 className="text-display-lg leading-[1.1] text-gray-900 drop-shadow-sm">
            Nha khoa Mec – Nụ cười tự tin, <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-tertiary-container)]">
              tỏa sáng mỗi ngày
            </span>
          </h1>
          
          <p className="text-xl text-[var(--color-on-surface-variant)] max-w-lg leading-relaxed">
            Chăm sóc răng miệng chuyên sâu với công nghệ hiện đại, mang lại vẻ đẹp tự nhiên và bền vững cho nụ cười của bạn.
          </p>
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-6">
            <button
              type="button"
              onClick={onBookNow}
              className="btn-primary flex items-center justify-center gap-2 text-lg group"
            >
              Đặt lịch khám ngay
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
            <button
              type="button"
              onClick={onConsultation}
              className="btn-secondary flex items-center justify-center gap-2 text-lg group"
            >
              <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">call</span>
              Tư vấn miễn phí
            </button>
          </div>

          <div className="pt-8 flex items-center gap-6 text-sm font-medium text-gray-500">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-500">check_circle</span>
              Đội ngũ chuyên gia
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-500">check_circle</span>
              Công nghệ Châu Âu
            </div>
          </div>
        </div>
      </div>

      {/* Floating 3D Elements */}
      <div className="hidden lg:block absolute top-32 right-[8%] floating-icon drop-shadow-2xl">
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-white">
          <span className="material-symbols-outlined text-[80px] text-[var(--color-primary)] opacity-80">dentistry</span>
        </div>
      </div>
      <div className="hidden lg:block absolute bottom-32 right-[15%] floating-icon drop-shadow-2xl" style={{ animationDelay: '-3s' }}>
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-white">
          <span className="material-symbols-outlined text-[70px] text-[var(--color-tertiary-container)] opacity-80">clinical_notes</span>
        </div>
      </div>
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-primary)] rounded-full mix-blend-multiply filter blur-[120px] opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-tertiary)] rounded-full mix-blend-multiply filter blur-[120px] opacity-20"></div>
    </section>
  );
};

export default Hero;
