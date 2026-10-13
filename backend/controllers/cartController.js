import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Helper to populate cart items with product details
const getPopulatedCart = async (userId) => {
  let cart = await Cart.findOne({ userId }).populate({
    path: 'items.productId',
    select: 'name brand price discount images stock'
  });

  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  // Filter out any items where product might have been deleted
  const validItems = cart.items.filter(item => item.productId != null);
  if (validItems.length !== cart.items.length) {
    cart.items = validItems;
    await cart.save();
  }

  return cart;
};

// @desc    Get logged in user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const cart = await getPopulatedCart(req.user._id);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add product to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += Number(quantity || 1);
    } else {
      cart.items.push({ productId, quantity: Number(quantity || 1) });
    }

    await cart.save();
    
    const populated = await getPopulatedCart(req.user._id);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id (Where :id is productId)
// @access  Private
export const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const productId = req.params.id;

  try {
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = Number(quantity);
      await cart.save();

      const populated = await getPopulatedCart(req.user._id);
      res.json(populated);
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove product from cart
// @route   DELETE /api/cart/:id (Where :id is productId)
// @access  Private
export const deleteCartItem = async (req, res) => {
  const productId = req.params.id;

  try {
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();

    const populated = await getPopulatedCart(req.user._id);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear user cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { items: [] },
      { new: true }
    );
    res.json(cart || { userId: req.user._id, items: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Internal backward compatibility helpers
export const internalInitCart = async (req, res) => {
  try {
    const { userId } = req.params;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const internalClearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOneAndUpdate({ userId }, { items: [] }, { new: true });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
