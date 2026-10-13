import express from 'express';
import { 
  getUsers, 
  updateUserByAdmin, 
  getAdminStats,
  getUserProfile,
  updateUserProfile,
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

router.post('/batch', batchGetUsers);

export default router;
