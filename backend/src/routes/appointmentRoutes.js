const express = require('express');
const router = express.Router();
const { 
  createAppointment, 
  monitorAppointments, 
  getFollowUpAppointments,
  getAppointments, 
  updateAppointmentStatus,
  updateAppointmentFollowUp,
  getDoctorTodayAppointments,
  examineAppointment,
  getAppointmentById
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/** @route /api/v1/appointments */
router.post('/', createAppointment);
router.get('/monitor', monitorAppointments);
router.get('/doctor-today', protect, authorize('DOCTOR', 'ADMIN'), getDoctorTodayAppointments);
router.get('/follow-ups', protect, authorize('ADMIN', 'RECEPTIONIST'), getFollowUpAppointments);
router.get('/', getAppointments);
router.get('/:id', protect, getAppointmentById);
router.patch('/:id/status', updateAppointmentStatus);
router.patch('/:id/follow-up', protect, authorize('ADMIN', 'RECEPTIONIST'), updateAppointmentFollowUp);

// Các tuyến đường dành riêng cho bác sĩ
router.put('/:id/examine', protect, authorize('DOCTOR', 'ADMIN'), examineAppointment);

module.exports = router;
