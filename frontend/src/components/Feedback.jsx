import React from 'react';

const testimonials = [
  {
    id: 1,
    name: 'Chị Nguyễn Thanh Hương',
    role: 'Khách hàng Niềng răng',
    text: 'Dịch vụ tại đây vô cùng chuyên nghiệp. Bác sĩ tư vấn rất kỹ, quá trình niềng răng của mình diễn ra rất nhẹ nhàng và không đau như mình nghĩ.',
    rating: 5,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBj0NKJDbmszv4TiMrQjaXEjTHqbNQAF8vzwnGicuVoxHQ0rsmu9g894otn6sQT-W-ol7eNwB9xDIe7cRn16X1kgNKdto0x5Zohaeh0Z-IGYfrq-NXU6su9ggOoVllGGP4r810BBXj0afDe7j_rCA65arc9HsWyMUtrsclexA7rtfiJ-WsrLsX2uq4yH-esA74e_iwOZrp3dSLtl3ztkhaeQvxiiO77gQXt7OoXqiYrnpPm-pXk6sWKyN54m7uiVt7kBQ4EzyHed1PD'
  },
  {
    id: 2,
    name: 'Anh Lê Văn Nam',
    role: 'Khách hàng Tẩy trắng',
    text: 'Rất hài lòng với kết quả tẩy trắng răng. Chỉ sau 45 phút, răng mình đã trắng bật tông rõ rệt. Cảm ơn đội ngũ Nha khoa Mec rất nhiều!',
    rating: 5,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3hDLkVq8q5yCTEDUqFZLKKrGwDe9ArTDQPwwMn4pbdB-oEpy2-otP0QRuhGB_yhHGWSm69Tuj1sXt-Y4ab1v_yuXVlHon1-LZmiCT5zMwurUTyl5gwqAJCf790skxV4LhUrzVtlhxrsenkX_2q4gWbkG6GIfRpkPwbAec9rtfgLba2CegD9caZogewV0nfQEA0vohoxAWv9qmOnCO-dL0Bxnah8QEqsrt9VwNkopVU_Vqma5zhDVvFG78gU5enf0pLQ9fTdrafq_K'
  }
];

const Feedback = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        <div className="grid lg:grid-cols-3 gap-16 items-center">
          <div className="lg:col-span-1 space-y-8 text-center lg:text-left">
            <h2 className="text-display-lg">Cảm nhận từ khách hàng</h2>
            <p className="text-body-lg text-on-surface-variant">
              Hơn 10.000+ nụ cười đã được thay đổi tại Nha khoa Mec qua từng năm.
            </p>
            <div className="flex gap-4 justify-center lg:justify-start">
              <button className="nav-btn">
                <span className="material-symbols-outlined">west</span>
              </button>
              <button className="nav-btn">
                <span className="material-symbols-outlined">east</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
            {testimonials.map((t) => (
              <div 
                key={t.id} 
                className="glass-card p-10 rounded-2xl relative"
                style={{ borderRadius: 'var(--radius-2xl)' }}
              >
                <span className="material-symbols-outlined absolute top-8 right-8 text-primary opacity-10 text-6xl">format_quote</span>
                
                <div className="flex gap-1 mb-6 text-[#ffc107]">
                  {[...Array(t.rating)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>

                <p className="text-on-surface italic mb-10 leading-relaxed">"{t.text}"</p>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden shadow-sm">
                    <img src={t.img} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="text-primary font-bold">{t.name}</h5>
                    <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
};

export default Feedback;
