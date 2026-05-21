const express = require('express');
const router = express.Router();
const { createDutySchedule, getDutySchedules, deleteDutySchedule } = require('../controllers/dutyController');

/** @route /api/v1/duty-schedules */
router.post('/', createDutySchedule);
router.get('/', getDutySchedules);
router.delete('/:id', deleteDutySchedule);

module.exports = router;
