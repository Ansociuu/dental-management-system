const express = require('express');
const router = express.Router();
const { createHoliday, getHolidays, updateHoliday, updateHolidayStatus } = require('../controllers/holidayController');

/** @route /api/v1/holidays */
router.post('/', createHoliday);
router.get('/', getHolidays);
router.put('/:id', updateHoliday);
router.patch('/:id/status', updateHolidayStatus);

module.exports = router;
