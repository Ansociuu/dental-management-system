import React from 'react';
import herosecs from '../assets/landingpage/herosecs.png';
import khonggian1 from '../assets/landingpage/khonggian1.png';


const images = [
  {
    id: 1,
    url: herosecs,
    span: 'col-span-2 row-span-2'
  },
  {
    id: 2,
    url: khonggian1,
    span: 'col-span-2 row-span-2'
  }
];

const Gallery = () => {
  return (
    <section className="section-padding" style={{ backgroundColor: 'var(--surface-container-low)' }}>
      <div className="container-max">
        <div className="text-center mb-16">
          <h2 className="text-display-lg">Không gian chuẩn 5 sao</h2>
          <p className="text-on-surface-variant mt-4">Trang thiết bị hiện đại, không gian sang trọng và vô trùng tuyệt đối.</p>
        </div>

        <div className="gallery-grid">
          {images.map((img) => (
            <div key={img.id} className={`gallery-item ${img.span}`}>
              <div>
                <img src={img.url} alt={`Mec Gallery ${img.id}`} className="w-full h-full object-cover" />
                <div className="overlay"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
