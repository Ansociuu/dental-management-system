/**
 * Xóa unique index cũ shiftId + dayOfWeek của bảng ShiftSalaryRule.
 * Chạy: npm run fix-shift-rule-indexes
 */
require('dotenv').config({ override: true });
const mongoose = require('mongoose');
const ShiftSalaryRule = require('../models/ShiftSalaryRule');

const validDayTypes = ['WEEKDAY_OFFICE', 'SATURDAY', 'SUNDAY', 'HOLIDAY'];

const inferDayType = (rule) => {
  if (validDayTypes.includes(rule.dayType)) return rule.dayType;
  if (rule.dayOfWeek === -3) return 'HOLIDAY';
  if (rule.dayOfWeek === -2) return 'WEEKDAY_OFFICE';
  if (rule.dayOfWeek === 6) return 'SATURDAY';
  if (rule.dayOfWeek === 0) return 'SUNDAY';
  return 'WEEKDAY_OFFICE';
};

const dayOfWeekByType = {
  WEEKDAY_OFFICE: -1,
  SATURDAY: 6,
  SUNDAY: 0,
  HOLIDAY: -3
};

const normalizeExistingRules = async () => {
  const rules = await ShiftSalaryRule.find().sort({ updatedAt: 1, createdAt: 1 }).lean();
  if (rules.length === 0) return;

  const normalizedMap = new Map();
  rules.forEach((rule) => {
    const dayType = inferDayType(rule);
    const key = `${rule.shiftId.toString()}:${dayType}`;
    normalizedMap.set(key, {
      shiftId: rule.shiftId,
      dayType,
      dayOfWeek: dayOfWeekByType[dayType],
      shiftCoefficient: Number(rule.shiftCoefficient) || 1,
      status: rule.status || 'ACTIVE',
      updatedBy: rule.updatedBy
    });
  });

  await ShiftSalaryRule.deleteMany({});
  await ShiftSalaryRule.insertMany(Array.from(normalizedMap.values()));
  console.log(`Đã chuẩn hóa ${rules.length} rule cũ thành ${normalizedMap.size} rule hợp lệ.`);
};

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const collection = ShiftSalaryRule.collection;
  const indexes = await collection.indexes();
  const oldIndex = indexes.find((index) => index.name === 'shiftId_1_dayOfWeek_1');

  if (oldIndex) {
    await collection.dropIndex('shiftId_1_dayOfWeek_1');
    console.log('Đã xóa index cũ shiftId_1_dayOfWeek_1.');
  } else {
    console.log('Không tìm thấy index cũ shiftId_1_dayOfWeek_1, không cần xóa.');
  }

  await normalizeExistingRules();
  await ShiftSalaryRule.syncIndexes();
  console.log('Đã đồng bộ index ShiftSalaryRule.');
  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error('Lỗi khi sửa index ShiftSalaryRule:', error.message);
  await mongoose.connection.close();
  process.exit(1);
});
