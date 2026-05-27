const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { protect, requirePermission } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(requirePermission('services', 'view'), serviceController.getServices)
  .post(requirePermission('services', 'create'), serviceController.createService);

router.route('/:id')
  .put(requirePermission('services', 'update'), serviceController.updateService)
  .delete(requirePermission('services', 'delete'), serviceController.deleteService);

module.exports = router;
