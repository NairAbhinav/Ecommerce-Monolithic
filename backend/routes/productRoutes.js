import express from 'express';
import { 
  getProducts,
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  createProductReview,
  getProductsBatch,
  getSellerProducts,
  validateAndDecrementStock,
  getProductsStats
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Batch, Seller & Stats Routes
router.post('/batch', getProductsBatch);
router.post('/validate-and-decrement-stock', validateAndDecrementStock);
router.get('/seller/:sellerId', getSellerProducts);
router.get('/internal/stats', getProductsStats);

// Main catalog & product management routes
router.route('/')
  .get(getProducts)
  .post(protect, authorize('seller', 'admin'), upload.array('images', 5), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorize('seller', 'admin'), upload.array('images', 5), updateProduct)
  .delete(protect, authorize('seller', 'admin'), deleteProduct);

router.route('/:id/reviews')
  .post(protect, authorize('customer'), createProductReview);

export default router;
