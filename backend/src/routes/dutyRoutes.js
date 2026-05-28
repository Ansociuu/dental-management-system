const express = require('express');
const router = express.Router();
const { createDutySchedule, getDutySchedules, getDutyHistory, deleteDutySchedule } = require('../controllers/dutyController');
const { protect, requirePermission } = require('../middlewares/authMiddleware');

/** @route /api/v1/duty-schedules */
router.use(protect);

router.post('/', requirePermission('doctorDuty', 'create'), createDutySchedule);
router.get('/history', requirePermission('doctorDuty', 'view'), getDutyHistory);
router.get('/', requirePermission('doctorDuty', 'view'), getDutySchedules);
router.delete('/:id', requirePermission('doctorDuty', 'delete'), deleteDutySchedule);

module.exports = router;
