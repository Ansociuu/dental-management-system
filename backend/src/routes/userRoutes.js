const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, requirePermission } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(requirePermission('users', 'view'), userController.getUsers)
  .post(requirePermission('users', 'create'), userController.createUser);

router.route('/:id')
  .get(requirePermission('users', 'view'), userController.getUserById)
  .put(requirePermission('users', 'update'), userController.updateUser)
  .delete(requirePermission('users', 'delete'), userController.deleteUser);

module.exports = router;
