const express = require('express');
const router = express.Router();
const { createPatient, getPatients, getPatientById, updatePatient, deletePatient } = require('../controllers/patientController');
const { protect, requirePermission } = require('../middlewares/authMiddleware');

/** @route /api/v1/patients */
router.use(protect);

router.post('/', requirePermission('patients', 'create'), createPatient);
router.get('/', requirePermission('patients', 'view'), getPatients);
router.get('/:id', requirePermission('patients', 'view'), getPatientById);
router.put('/:id', requirePermission('patients', 'update'), updatePatient);
router.delete('/:id', requirePermission('patients', 'delete'), deletePatient);

module.exports = router;
