const express = require('express');
const router = express.Router();
const { createAppointment, monitorAppointments, getAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');

/** @route /api/v1/appointments */
router.post('/', createAppointment);
router.get('/monitor', monitorAppointments);
router.get('/', getAppointments);
router.patch('/:id/status', updateAppointmentStatus);

module.exports = router;
