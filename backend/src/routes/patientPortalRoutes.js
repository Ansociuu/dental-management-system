const express = require('express');
const router = express.Router();
const {
  getPortalMe,
  updatePortalMe,
  getPortalAppointments,
  getPortalAppointmentById,
  createPortalAppointment,
  getBookingOptions,
  getBookingAvailability,
  getDoctorSuggestions,
  getPortalInvoices
} = require('../controllers/patientPortalController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect, authorize('PATIENT'));

router.get('/me', getPortalMe);
router.patch('/me', updatePortalMe);
router.get('/booking-options', getBookingOptions);
router.get('/booking-availability', getBookingAvailability);
router.get('/appointments', getPortalAppointments);
router.post('/appointments', createPortalAppointment);
router.get('/appointments/:id', getPortalAppointmentById);
router.get('/doctors/suggestions', getDoctorSuggestions);
router.get('/invoices', getPortalInvoices);

module.exports = router;
