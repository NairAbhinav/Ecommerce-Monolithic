import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user details by admin
// @route   PUT /api/users/:id
// @access  Private (Admin)
export const updateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      user.phone = req.body.phone || user.phone;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses || [],
        profileImage: user.profileImage || ''
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      if (req.body.addresses) {
        user.addresses = req.body.addresses;
      }

      if (req.body.profileImage !== undefined) {
        user.profileImage = req.body.profileImage;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        addresses: updatedUser.addresses,
        profileImage: updatedUser.profileImage
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get analytics for admin dashboard
// @route   GET /api/users/analytics/dashboard
// @access  Private (Admin)
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalProducts = await Product.countDocuments({});

    // Product Category breakdown
    const categoryStats = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Order statistics
    const allOrders = await Order.find({});
    const totalOrders = allOrders.length;

    let revenue = 0;
    allOrders.forEach((o) => {
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
        const prodId = item.productId ? item.productId.toString() : 'unknown';
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
      totalUsers,
      totalProducts,
      totalOrders,
      revenue,
      categoryStats,
      monthlySales: formattedMonthlySales,
      topSellingProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Batch endpoint for looking up users
export const batchGetUsers = async (req, res) => {
  const { userIds } = req.body;
  try {
    const users = await User.find({ _id: { $in: userIds } }).select('name email');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
