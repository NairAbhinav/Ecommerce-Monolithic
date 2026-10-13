import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { sendOrderEmail } from '../config/mail.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer)
export const createOrder = async (req, res) => {
  const { products, shippingAddress, paymentMethod, paymentId, totalAmount } = req.body;

  try {
    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'No products in order' });
    }

    // 1. Validate stock availability and decrement stock directly in Product model
    const productsToUpdate = [];
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name || item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Not enough stock for ${item.name || product.name}. Available: ${product.stock}` 
        });
      }
      productsToUpdate.push({ product, quantity: item.quantity });
    }

    // Decrement stock
    for (const entry of productsToUpdate) {
      entry.product.stock -= entry.quantity;
      await entry.product.save();
    }

    // 2. Create the order
    const order = new Order({
      userId: req.user._id,
      products,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      paymentId,
      totalAmount
    });

    const createdOrder = await order.save();

    // 3. Clear user cart directly
    try {
      await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] });
    } catch (err) {
      console.error('Failed to clear user cart in checkout:', err.message);
    }

    // 4. Send confirmation email
    try {
      await sendOrderEmail(createdOrder, req.user);
    } catch (err) {
      console.error('Failed to send confirmation email:', err.message);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user orders or seller/admin orders
// @route   GET /api/orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      // Admin sees all orders with user info populated
      const orders = await Order.find({})
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
      return res.json(orders);
    } else if (req.user.role === 'seller') {
      // Seller sees orders that contain their products
      const sellerProducts = await Product.find({ sellerId: req.user._id }).select('_id');
      const productIds = sellerProducts.map(p => p._id.toString());

      const allOrders = await Order.find({})
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });

      const sellerOrders = allOrders.filter(order => 
        order.products.some(item => productIds.includes(item.productId.toString()))
      );

      return res.json(sellerOrders);
    } else {
      // Customer sees their own orders
      const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
      return res.json(orders);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private (Seller/Admin)
export const updateOrderStatus = async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.orderStatus = orderStatus || order.orderStatus;
      order.paymentStatus = paymentStatus || order.paymentStatus;

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/internal/stats
export const getOrderStats = async (req, res) => {
  try {
    const allOrders = await Order.find({});
    const totalOrders = allOrders.length;

    let revenue = 0;
    allOrders.forEach(o => {
      if (o.paymentStatus === 'Paid' || o.paymentMethod === 'COD') {
        revenue += o.totalAmount;
      }
    });

    const monthlySales = await Order.aggregate([
      {
        $match: {
          $or: [
            { paymentStatus: 'Paid' },
            { paymentMethod: 'COD' }
          ]
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          sales: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthlySales = monthlySales.map(item => ({
      month: monthNames[item._id - 1] || `Month ${item._id}`,
      sales: item.sales,
      count: item.count
    }));

    const productSalesMap = {};
    allOrders.forEach(order => {
      order.products.forEach(item => {
        const prodId = item.productId.toString();
        if (!productSalesMap[prodId]) {
          productSalesMap[prodId] = {
            name: item.name,
            sales: 0,
            quantity: 0
          };
        }
        productSalesMap[prodId].sales += item.price * item.quantity;
        productSalesMap[prodId].quantity += item.quantity;
      });
    });

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.json({
      totalOrders,
      revenue,
      monthlySales: formattedMonthlySales,
      topSellingProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
