import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

// Connect Database
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register REST Routes
app.use('/api/orders', orderRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Order Service is running...');
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

const PORT = process.env.PORT || 5006;

app.listen(PORT, () => {
  console.log(`Order Service running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
