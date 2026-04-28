import React from 'react';
import doingu from '../assets/landingpage/doingu.png';

const About = () => {
  return (
    <section id="about" className="section-padding bg-white overflow-hidden">
      <div className="container-max">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div className="relative">
            {/* Main Image */}
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={doingu} 
                alt="Đội ngũ bác sĩ Mec" 
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            
            {/* Experience Card */}
            <div 
              className="glass-card absolute -bottom-8 -right-8 p-8 rounded-2xl max-w-[260px] hidden sm:block"
              style={{ borderRadius: 'var(--radius-2xl)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-tertiary-container text-4xl">verified</span>
                <span className="text-2xl font-extrabold text-primary">15+ Năm</span>
              </div>
              <p className="text-sm font-semibold text-on-surface-variant">
                Kinh nghiệm trong lĩnh vực nha khoa thẩm mỹ cao cấp
              </p>
            </div>
          </div>

          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-headline-lg">Sứ mệnh kiến tạo nụ cười hoàn mỹ</h2>
              <p className="text-on-surface-variant leading-relaxed">
                Tại Nha khoa Mec, chúng tôi tin rằng một nụ cười rạng rỡ là chìa khóa của sự tự tin. 
                Với đội ngũ bác sĩ giàu kinh nghiệm và trang thiết bị hiện đại bậc nhất, 
                chúng tôi cam kết mang đến trải nghiệm chăm sóc răng miệng không đau, 
                an toàn và hiệu quả tuyệt đối cho mọi khách hàng.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--secondary-container)', color: 'var(--secondary)' }}>
                  <span className="material-symbols-outlined text-3xl">health_and_safety</span>
                </div>
                <div>
                  <h4 className="text-primary text-lg mb-1">An toàn tuyệt đối</h4>
                  <p className="text-sm text-on-surface-variant">Quy trình vô trùng chuẩn quốc tế nghiêm ngặt.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-4 rounded-2xl" style={{ backgroundColor: 'rgba(0, 104, 51, 0.1)', color: 'var(--tertiary)' }}>
                  <span className="material-symbols-outlined text-3xl">precision_manufacturing</span>
                </div>
                <div>
                  <h4 className="text-primary text-lg mb-1">Công nghệ 4.0</h4>
                  <p className="text-sm text-on-surface-variant">Trang thiết bị hiện đại nhập khẩu từ Châu Âu.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
