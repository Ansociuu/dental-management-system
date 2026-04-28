import React from 'react';

const services = [
  {
    id: 1,
    title: 'Khám tổng quát',
    desc: 'Kiểm tra định kỳ, tư vấn lộ trình chăm sóc răng miệng cá nhân hóa.',
    icon: 'medical_services',
    color: 'var(--primary-container)',
    bgColor: 'var(--on-primary-container)'
  },
  {
    id: 2,
    title: 'Lấy cao răng',
    desc: 'Vệ sinh chuyên sâu bằng công nghệ siêu âm không đau, bảo vệ nướu.',
    icon: 'cleaning_services',
    color: 'var(--secondary)',
    bgColor: 'var(--secondary-container)'
  },
  {
    id: 3,
    title: 'Trám răng',
    desc: 'Sử dụng vật liệu cao cấp, màu sắc tự nhiên như răng thật.',
    icon: 'dentistry',
    color: 'var(--tertiary)',
    bgColor: 'var(--tertiary-fixed)'
  },
  {
    id: 4,
    title: 'Nhổ răng',
    desc: 'Quy trình nhẹ nhàng, nhổ răng khôn không đau bằng máy Piezotome.',
    icon: 'chip_extraction',
    color: '#ba1a1a',
    bgColor: '#ffdad6'
  },
  {
    id: 5,
    title: 'Niềng răng',
    desc: 'Đa dạng lựa chọn: Mắc cài sứ, kim loại hoặc khay trong suốt Invisalign.',
    icon: 'orthopedics',
    color: 'var(--primary)',
    bgColor: 'var(--primary-fixed)'
  },
  {
    id: 6,
    title: 'Tẩy trắng răng',
    desc: 'Bật tông nhanh chóng, an toàn cho men răng với công nghệ Laser.',
    icon: 'auto_fix_high',
    color: 'var(--tertiary-container)',
    bgColor: 'var(--tertiary-fixed-dim)'
  }
];

const Services = () => {
  return (
    <section id="services" className="section-padding" style={{ backgroundColor: 'var(--surface)' }}>
      <div className="container-max">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-tertiary-container font-bold uppercase tracking-wider text-sm">Dịch vụ của chúng tôi</span>
          <h2 className="text-display-lg">Giải pháp nha khoa toàn diện</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="glass-card p-10 rounded-2xl group hover:transform hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              style={{ borderRadius: 'var(--radius-2xl)' }}
            >
              <div 
                className="w-16 h-16 rounded-2xl mb-8 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{ backgroundColor: service.bgColor, color: service.color }}
              >
                <span className="material-symbols-outlined text-3xl">{service.icon}</span>
              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">{service.title}</h3>
              <p className="text-on-surface-variant mb-8">{service.desc}</p>
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                Tìm hiểu thêm 
                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
