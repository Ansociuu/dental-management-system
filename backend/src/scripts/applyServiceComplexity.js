/**
 * Áp hệ số độ khó mặc định cho dịch vụ hiện có.
 * Chạy: npm run apply-service-complexity
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('../models/Service');

const rules = [
  {
    coefficient: 0.5,
    reason: 'Phẫu thuật/cấy ghép kỹ thuật cao',
    patterns: [/implant/i, /cấy ghép/i, /cay ghep/i, /ghép xương/i, /ghep xuong/i, /nâng xoang/i, /nang xoang/i, /phẫu thuật/i, /phau thuat/i]
  },
  {
    coefficient: 0.4,
    reason: 'Điều trị phức tạp hoặc kéo dài',
    patterns: [/điều trị tủy/i, /dieu tri tuy/i, /nội nha/i, /noi nha/i, /niềng/i, /nieng/i, /chỉnh nha/i, /chinh nha/i, /invisalign/i]
  },
  {
    coefficient: 0.3,
    reason: 'Tiểu phẫu/nhổ răng khó',
    patterns: [/nhổ răng khôn/i, /nho rang khon/i, /tiểu phẫu/i, /tieu phau/i, /răng khôn/i, /rang khon/i]
  },
  {
    coefficient: 0.2,
    reason: 'Phục hình hoặc thủ thuật trung bình',
    patterns: [/bọc răng/i, /boc rang/i, /răng sứ/i, /rang su/i, /phục hình/i, /phuc hinh/i, /cầu răng/i, /cau rang/i, /mão/i, /mao/i]
  },
  {
    coefficient: 0.1,
    reason: 'Thủ thuật đơn giản',
    patterns: [/trám/i, /tram/i, /tẩy trắng/i, /tay trang/i, /laser/i, /nhổ răng sữa/i, /nho rang sua/i]
  },
  {
    coefficient: 0,
    reason: 'Khám, tư vấn hoặc dự phòng',
    patterns: [/khám/i, /kham/i, /tư vấn/i, /tu van/i, /lấy cao/i, /lay cao/i, /cạo vôi/i, /cao voi/i, /đánh bóng/i, /danh bong/i, /vệ sinh/i, /ve sinh/i]
  }
];

const classifyService = (service) => {
  const haystack = `${service.name || ''} ${service.description || ''}`;
  const matchedRule = rules.find((rule) => rule.patterns.some((pattern) => pattern.test(haystack)));
  return matchedRule || {
    coefficient: 0.1,
    reason: 'Mặc định cho dịch vụ chưa phân loại rõ',
    patterns: []
  };
};

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const services = await Service.find().sort({ name: 1 });

  if (services.length === 0) {
    console.log('Không có dịch vụ nào để cập nhật.');
    await mongoose.connection.close();
    return;
  }

  console.log(`Tìm thấy ${services.length} dịch vụ. Bắt đầu áp hệ số độ khó...`);

  for (const service of services) {
    const rule = classifyService(service);
    service.complexityCoefficient = rule.coefficient;
    await service.save();
    console.log(`- ${service.name}: ${rule.coefficient} (${rule.reason})`);
  }

  console.log('Hoàn tất cập nhật hệ số độ khó dịch vụ.');
  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error('Lỗi khi cập nhật hệ số độ khó dịch vụ:', error.message);
  await mongoose.connection.close();
  process.exit(1);
});
