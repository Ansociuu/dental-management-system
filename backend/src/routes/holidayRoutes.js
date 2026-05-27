const express = require('express');
const router = express.Router();
const { createHoliday, getHolidays, updateHoliday, updateHolidayStatus } = require('../controllers/holidayController');
const { protect, requirePermission } = require('../middlewares/authMiddleware');

/** @route /api/v1/holidays */
router.use(protect);

router.post('/', requirePermission('settings', 'create'), createHoliday);
router.get('/', requirePermission('settings', 'view'), getHolidays);
router.put('/:id', requirePermission('settings', 'update'), updateHoliday);
router.patch('/:id/status', requirePermission('settings', 'update'), updateHolidayStatus);

module.exports = router;
