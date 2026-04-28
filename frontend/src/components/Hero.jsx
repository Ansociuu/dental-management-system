import React from 'react';
import heroImg from '../assets/landingpage/herosecs.png';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-white">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImg} 
          alt="Mec Dental Hero" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, #ffffff 30%, rgba(255,255,255,0.7) 60%, transparent 100%)' }}></div>
      </div>

      <div className="container-max relative z-10">
        <div className="max-w-2xl space-y-8">
          <div 
            className="inline-block px-4 py-1 rounded-full text-secondary font-bold text-sm"
            style={{ backgroundColor: 'var(--secondary-container)' }}
          >
            Chuẩn mực Nha khoa quốc tế
          </div>
          
          <h1 className="text-display-lg leading-tight">
            Nha khoa Mec – Nụ cười tự tin, <br/>
            <span style={{ color: 'var(--tertiary-container)' }}>tỏa sáng mỗi ngày</span>
          </h1>
          
          <p className="text-body-lg text-on-surface-variant max-w-lg">
            Chăm sóc răng miệng chuyên sâu với công nghệ hiện đại, mang lại vẻ đẹp tự nhiên và bền vững cho nụ cười của bạn.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <button className="btn-primary">Đặt lịch khám ngay</button>
            <button className="btn-secondary">Tư vấn miễn phí</button>
          </div>
        </div>
      </div>

      {/* Floating 3D Elements */}
      <div className="hidden lg:block absolute top-1/4 right-[10%] floating-icon">
        <span className="material-symbols-outlined text-[120px] text-primary opacity-10">dentistry</span>
      </div>
      <div className="hidden lg:block absolute bottom-1/4 right-[25%] floating-icon" style={{ animationDelay: '-3s' }}>
        <span className="material-symbols-outlined text-[100px] text-tertiary opacity-10">clinical_notes</span>
      </div>
    </section>
  );
};

export default Hero;
