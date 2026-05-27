const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, requirePermission } = require('../middlewares/authMiddleware');

router.get('/stats', protect, requirePermission('dashboard', 'view'), getDashboardStats);

module.exports = router;
