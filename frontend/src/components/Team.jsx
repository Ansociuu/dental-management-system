import React from 'react';
import bs1 from '../assets/landingpage/bs1.png';
import bs2 from '../assets/landingpage/bs2.png';
import bs3 from '../assets/landingpage/bs3.png';
import bs4 from '../assets/landingpage/bs4.png';

const doctors = [
  {
    id: 1,
    name: 'BS. Nguyễn Tiến Doanh',
    role: 'Giám đốc chuyên môn',
    specialty: 'Chuyên gia Chỉnh nha & Niềng răng',
    img: bs1
  },
  {
    id: 2,
    name: 'BS. Nguyễn Văn An',
    role: 'Bác sĩ chuyên khoa II',
    specialty: 'Chuyên gia Răng sứ thẩm mỹ',
    img: bs2
  },
  {
    id: 3,
    name: 'BS. Phạm Thị Minh Ngọc',
    role: 'Tiến sĩ Nha khoa',
    specialty: 'Chuyên gia Implant',
    img: bs3
  },
  {
    id: 4,
    name: 'BS. Từ Hữu Minh Vũ',
    role: 'Thạc sĩ Y khoa',
    specialty: 'Chuyên gia Nha khoa Tổng quát',
    img: bs4
  }
];

const Team = () => {
  return (
    <section id="doctors" className="section-padding bg-white">
      <div className="container-max">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <span className="text-tertiary-container font-bold uppercase tracking-wider text-sm">Chuyên gia hàng đầu</span>
            <h2 className="text-display-lg">Đội ngũ bác sĩ tâm huyết</h2>
          </div>
          <button className="flex items-center gap-2 text-primary font-bold hover:translate-x-2 transition-transform">
            Xem toàn bộ đội ngũ <span className="material-symbols-outlined">east</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-6 shadow-md">
                <img 
                  src={doctor.img} 
                  alt={doctor.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <p className="text-white text-sm font-semibold">{doctor.specialty}</p>
                </div>
              </div>
              <h4 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{doctor.name}</h4>
              <p className="text-on-surface-variant font-medium text-sm">{doctor.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
