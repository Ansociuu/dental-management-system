const express = require('express');
const router = express.Router();
const {
  getBaseRate,
  updateBaseRate,
  getDoctorProfiles,
  getDegreeCoefficients,
  updateDegreeCoefficient,
  updateDoctorProfile,
  getShiftRules,
  updateShiftRules,
  getComplexities,
  updateComplexities,
  generatePayslip,
  getPayslips,
  getMonthlySalaryReport,
  getDoctorYearlySalaryReport,
  getYearlySalaryReport
} = require('../controllers/salaryController');
const { protect, requirePermission } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/settings/base-rate', requirePermission('payroll', 'view'), getBaseRate);
router.put('/settings/base-rate', requirePermission('payroll', 'update'), updateBaseRate);

router.get('/doctor-profiles', requirePermission('payroll', 'view'), getDoctorProfiles);
router.put('/doctor-profiles/:doctorId', requirePermission('payroll', 'update'), updateDoctorProfile);
router.get('/degree-coefficients', requirePermission('payroll', 'view'), getDegreeCoefficients);
router.put('/degree-coefficients/:degreeLevel', requirePermission('payroll', 'update'), updateDegreeCoefficient);

router.get('/shift-rules', requirePermission('payroll', 'view'), getShiftRules);
router.put('/shift-rules', requirePermission('payroll', 'update'), updateShiftRules);

router.get('/complexities', requirePermission('payroll', 'view'), getComplexities);
router.put('/complexities', requirePermission('payroll', 'update'), updateComplexities);

router.get('/payslips', requirePermission('payroll', 'view'), getPayslips);
router.post('/payslips/generate', requirePermission('payroll', 'create'), generatePayslip);

router.get('/reports/monthly', requirePermission('payroll', 'view'), getMonthlySalaryReport);
router.get('/reports/doctor-yearly', requirePermission('payroll', 'view'), getDoctorYearlySalaryReport);
router.get('/reports/yearly', requirePermission('payroll', 'view'), getYearlySalaryReport);

module.exports = router;
