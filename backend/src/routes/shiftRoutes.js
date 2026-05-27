const express = require('express');
const router = express.Router();
const { createShift, getShifts, updateShift, deleteShift } = require('../controllers/shiftController');
const { protect, requirePermission } = require('../middlewares/authMiddleware');

/** @route /api/v1/shifts */
router.use(protect);

router.post('/', requirePermission('settings', 'create'), createShift);
router.get('/', requirePermission('settings', 'view'), getShifts);
router.put('/:id', requirePermission('settings', 'update'), updateShift);
router.delete('/:id', requirePermission('settings', 'delete'), deleteShift);

module.exports = router;
