const express = require('express');
const router = express.Router();
const { getPermissions, updateRolePermissions } = require('../controllers/permissionController');
const { protect, requirePermission } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', requirePermission('roles', 'view'), getPermissions);
router.put('/:role', requirePermission('roles', 'update'), updateRolePermissions);

module.exports = router;
