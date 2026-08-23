import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import proxy from 'express-http-proxy';

dotenv.config();

const app = express();

app.use(cors());

// Serve static upload directory from the Product Service uploads folder
const __dirname = path.resolve();
const uploadsPath = path.join(__dirname, '../services/product-service/uploads');
app.use('/uploads', express.static(uploadsPath));

// Middleware to log proxy routing
app.use((req, res, next) => {
  console.log(`[Gateway Proxy] ${req.method} ${req.originalUrl}`);
  next();
});

// Helper: preserve the original request path when proxying
const withPath = (prefix) => ({
  proxyReqPathResolver: (req) => `${prefix}${req.url}`
});

// Proxy routes matching the implementation plan
app.use('/api/auth', proxy('http://localhost:5001', withPath('/api/auth')));
app.use('/api/users', proxy('http://localhost:5002', withPath('/api/users')));

// Route GET /api/products (specifically product listing/searching/filtering) to Search Service
// Note: app.get passes the full original URL as req.url (unlike app.use which strips the mount path),
// so we pass req.url directly to avoid doubling the path prefix.
app.get('/api/products', proxy('http://localhost:5004', {
  proxyReqPathResolver: (req) => req.url
}));

// Route all other Product Service actions (CRUD, details, reviews, batch) to Product Service
app.use('/api/products', proxy('http://localhost:5003', withPath('/api/products')));

app.use('/api/cart', proxy('http://localhost:5005', withPath('/api/cart')));
app.use('/api/orders', proxy('http://localhost:5006', withPath('/api/orders')));

// Root route
app.get('/', (req, res) => {
  res.send('API Gateway is running...');
});

// Custom 404 handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Global Error Handler Middleware
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
  console.log(`API Gateway running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
