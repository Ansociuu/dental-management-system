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
const { protect, authorize, requirePermission } = require('../middlewares/authMiddleware');

/** @route /api/v1/appointments */
router.post('/', protect, requirePermission('appointments', 'create'), createAppointment);
router.get('/monitor', protect, requirePermission('appointments', 'view'), monitorAppointments);
router.get('/doctor-today', protect, authorize('DOCTOR', 'ADMIN'), getDoctorTodayAppointments);
router.get('/follow-ups', protect, requirePermission('followUps', 'view'), getFollowUpAppointments);
router.get('/', protect, requirePermission('appointments', 'view'), getAppointments);
router.get('/:id', protect, requirePermission('appointments', 'view'), getAppointmentById);
router.patch('/:id/status', protect, requirePermission('appointments', 'update'), updateAppointmentStatus);
router.patch('/:id/follow-up', protect, requirePermission('followUps', 'update'), updateAppointmentFollowUp);

// Các tuyến đường dành riêng cho bác sĩ
router.put('/:id/examine', protect, authorize('DOCTOR', 'ADMIN'), requirePermission('records', 'update'), examineAppointment);

module.exports = router;
