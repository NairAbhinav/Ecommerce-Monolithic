import express from 'express';
import { 
  createOrder, 
  getMyOrders, 
  updateOrderStatus,
  getOrderStats
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/internal/stats', getOrderStats);

router.route('/')
  .post(protect, authorize('customer'), createOrder)
  .get(protect, getMyOrders);

router.route('/:id')
  .put(protect, authorize('seller', 'admin'), updateOrderStatus);

export default router;
