const express = require('express');
const router = express.Router();
const {
  getDoctorPerformanceReport,
  getPatientsServicesReport
} = require('../controllers/reportController');
const { protect, requirePermission } = require('../middlewares/authMiddleware');

router.use(protect, requirePermission('reports', 'view'));

router.get('/doctor-performance', getDoctorPerformanceReport);
router.get('/patients-services', getPatientsServicesReport);

module.exports = router;
