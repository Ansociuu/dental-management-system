const express = require('express');
const router = express.Router();
const { getConfigChangeLogs } = require('../controllers/configChangeLogController');
const { protect, requirePermission } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', requirePermission('settings', 'view'), getConfigChangeLogs);

module.exports = router;
