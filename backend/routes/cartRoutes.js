import express from 'express';
import { 
  getCart, 
  addToCart, 
  updateCartItem, 
  deleteCartItem,
  clearCart,
  internalInitCart,
  internalClearCart
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Internal/Inter-service routes for backward compatibility
router.post('/internal/init/:userId', internalInitCart);
router.delete('/internal/clear/:userId', internalClearCart);

// Standard routes
router.route('/')
  .get(protect, getCart)
  .post(protect, addToCart)
  .delete(protect, clearCart);

router.route('/:id')
  .put(protect, updateCartItem)
  .delete(protect, deleteCartItem);

export default router;
