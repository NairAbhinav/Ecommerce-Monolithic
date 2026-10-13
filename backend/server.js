import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[Monolith] ${req.method} ${req.originalUrl}`);
  }
  next();
});

const __dirname = path.resolve();

// Static uploads directory
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', mode: 'monolith', timestamp: new Date() });
});

// Serve frontend static build in production (or if dist folder exists)
const frontendDistPath = path.join(__dirname, '../frontend/dist');
const localDistPath = path.join(__dirname, 'public');

let staticPath = null;
if (fs.existsSync(localDistPath) && fs.existsSync(path.join(localDistPath, 'index.html'))) {
  staticPath = localDistPath;
} else if (fs.existsSync(frontendDistPath) && fs.existsSync(path.join(frontendDistPath, 'index.html'))) {
  staticPath = frontendDistPath;
}

if (staticPath) {
  console.log(`Serving static frontend from: ${staticPath}`);
  app.use(express.static(staticPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Monolithic E-Commerce API is running...');
  });
}

// 404 Handler for unmatched routes
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Monolithic E-Commerce Platform running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default app;
