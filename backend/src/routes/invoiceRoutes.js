const express = require('express');
const router = express.Router();
const {
  getPendingInvoices,
  getInvoices,
  getInvoiceById,
  createInvoiceFromAppointment
} = require('../controllers/invoiceController');
const { protect, requirePermission } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/pending', requirePermission('payments', 'view'), getPendingInvoices);
router.get('/', requirePermission('payments', 'view'), getInvoices);
router.get('/:id', requirePermission('payments', 'view'), getInvoiceById);
router.post('/from-appointment/:appointmentId', requirePermission('payments', 'create'), createInvoiceFromAppointment);

module.exports = router;
