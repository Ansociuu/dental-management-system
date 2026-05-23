const express = require('express');
const router = express.Router();
const { createShift, getShifts, updateShift, deleteShift } = require('../controllers/shiftController');

/** @route /api/v1/shifts */
router.post('/', createShift);
router.get('/', getShifts);
router.put('/:id', updateShift);
router.delete('/:id', deleteShift);

module.exports = router;
