import express from 'express';
import { 
  getCart, 
  addToCart, 
  updateCartItem, 
  deleteCartItem,
  internalInitCart,
  internalClearCart
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Internal/Inter-service routes
router.post('/internal/init/:userId', internalInitCart);
router.delete('/internal/clear/:userId', internalClearCart);

// Standard routes
router.route('/')
  .get(protect, getCart)
  .post(protect, addToCart);

router.route('/:id')
  .put(protect, updateCartItem)
  .delete(protect, deleteCartItem);

export default router;
