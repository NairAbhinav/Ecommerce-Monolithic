import express from 'express';
import { getProducts, syncCreate, syncUpdate, syncDelete } from '../controllers/searchController.js';

const router = express.Router();

// Public listing
router.get('/', getProducts);

// Internal sync routes
router.post('/sync', syncCreate);
router.put('/sync/:id', syncUpdate);
router.delete('/sync/:id', syncDelete);

export default router;
