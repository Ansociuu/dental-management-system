const express = require('express');
const router = express.Router();
const { createShift, getShifts, updateShift } = require('../controllers/shiftController');

/** @route /api/v1/shifts */
router.post('/', createShift);
router.get('/', getShifts);
router.put('/:id', updateShift);

module.exports = router;
