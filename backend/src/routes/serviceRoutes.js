const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

router.route('/')
  .get(serviceController.getServices)
  .post(serviceController.createService);

router.route('/:id')
  .put(serviceController.updateService)
  .delete(serviceController.deleteService);

module.exports = router;
