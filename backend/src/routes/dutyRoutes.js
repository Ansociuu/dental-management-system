const express = require('express');
const router = express.Router();
const { createDutySchedule, getDutySchedules, deleteDutySchedule } = require('../controllers/dutyController');
const { protect, requirePermission } = require('../middlewares/authMiddleware');

/** @route /api/v1/duty-schedules */
router.use(protect);

router.post('/', requirePermission('doctorDuty', 'create'), createDutySchedule);
router.get('/', requirePermission('doctorDuty', 'view'), getDutySchedules);
router.delete('/:id', requirePermission('doctorDuty', 'delete'), deleteDutySchedule);

module.exports = router;
