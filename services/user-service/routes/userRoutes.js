import express from 'express';
import { 
  getUsers, 
  updateUserByAdmin, 
  getAdminStats,
  getUserProfile,
  updateUserProfile,
  internalRegister,
  internalLogin,
  batchGetUsers
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Profile routes (any logged-in user)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin-only dashboard analytics
router.route('/analytics/dashboard')
  .get(protect, authorize('admin'), getAdminStats);

// Admin-only user management routes
router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/:id')
  .put(protect, authorize('admin'), updateUserByAdmin);

// ================= INTERNAL ENDPOINTS =================
router.post('/internal/register', internalRegister);
router.post('/internal/login', internalLogin);
router.post('/batch', batchGetUsers);

export default router;
