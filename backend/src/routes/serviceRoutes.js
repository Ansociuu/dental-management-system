const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { protect, requirePermission } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(requirePermission('services', 'view'), serviceController.getServices)
  .post(requirePermission('services', 'create'), serviceController.createService);

router.post('/prices/bulk', requirePermission('services', 'update'), serviceController.bulkUpdateServicePrices);

router.route('/:id/price-history')
  .get(requirePermission('services', 'view'), serviceController.getServicePriceHistory)
  .post(requirePermission('services', 'update'), serviceController.createServicePrice);

router.route('/:id')
  .put(requirePermission('services', 'update'), serviceController.updateService)
  .delete(requirePermission('services', 'delete'), serviceController.deleteService);

module.exports = router;
