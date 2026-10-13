import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

// Helper to get items from local storage
const getLocalCart = () => {
  try {
    const cart = localStorage.getItem('guestCart');
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

const initialState = {
  cartItems: [],
  loading: false,
  error: null
};

// Fetch cart items (and sync any guest cart items if logged in)
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { getState, rejectWithValue }) => {
  const { auth } = getState();
  if (auth.userInfo) {
    try {
      // Sync any guest cart items to the database cart
      const guestCart = getLocalCart();
      if (guestCart && guestCart.length > 0) {
        for (const item of guestCart) {
          try {
            await api.post('/cart', { productId: item.productId, quantity: item.quantity });
          } catch (e) {
            console.error('Failed to sync guest cart item:', e.message);
          }
        }
        localStorage.removeItem('guestCart');
      }

      const { data } = await api.get('/cart');
      return (data.items || []).map(item => ({
        productId: item.productId?._id || item.productId || '',
        name: item.productId?.name || 'Item',
        brand: item.productId?.brand || '',
        price: item.productId?.price || 0,
        discount: item.productId?.discount || 0,
        image: item.productId?.images?.[0] || '',
        stock: item.productId?.stock || 0,
        quantity: item.quantity
      }));
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  } else {
    // Guest cart from local storage
    return getLocalCart();
  }
});

// Add to cart
export const addToCart = createAsyncThunk('cart/addToCart', async ({ product, quantity }, { getState, rejectWithValue }) => {
  const { auth } = getState();
  const qty = Number(quantity || 1);

  if (auth.userInfo) {
    try {
      const { data } = await api.post('/cart', { productId: product._id, quantity: qty });
      return (data.items || []).map(item => ({
        productId: item.productId?._id || item.productId || '',
        name: item.productId?.name || '',
        brand: item.productId?.brand || '',
        price: item.productId?.price || 0,
        discount: item.productId?.discount || 0,
        image: item.productId?.images?.[0] || '',
        stock: item.productId?.stock || 0,
        quantity: item.quantity
      }));
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  } else {
    // Guest logic
    const cart = getLocalCart();
    const existItem = cart.find(item => item.productId === product._id);
    if (existItem) {
      existItem.quantity += qty;
    } else {
      cart.push({
        productId: product._id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        discount: product.discount,
        image: product.images?.[0] || '',
        stock: product.stock,
        quantity: qty
      });
    }
    localStorage.setItem('guestCart', JSON.stringify(cart));
    return cart;
  }
});

// Update cart item quantity
export const updateCartQty = createAsyncThunk('cart/updateCartQty', async ({ productId, quantity }, { getState, rejectWithValue }) => {
  const { auth } = getState();
  const qty = Number(quantity);

  if (auth.userInfo) {
    try {
      const { data } = await api.put(`/cart/${productId}`, { quantity: qty });
      return (data.items || []).map(item => ({
        productId: item.productId?._id || item.productId || '',
        name: item.productId?.name || '',
        brand: item.productId?.brand || '',
        price: item.productId?.price || 0,
        discount: item.productId?.discount || 0,
        image: item.productId?.images?.[0] || '',
        stock: item.productId?.stock || 0,
        quantity: item.quantity
      }));
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  } else {
    // Guest
    const cart = getLocalCart();
    const existItem = cart.find(item => item.productId === productId);
    if (existItem) {
      existItem.quantity = qty;
    }
    localStorage.setItem('guestCart', JSON.stringify(cart));
    return cart;
  }
});

// Delete item
export const deleteCartItem = createAsyncThunk('cart/deleteCartItem', async (productId, { getState, rejectWithValue }) => {
  const { auth } = getState();

  if (auth.userInfo) {
    try {
      const { data } = await api.delete(`/cart/${productId}`);
      return (data.items || []).map(item => ({
        productId: item.productId?._id || item.productId || '',
        name: item.productId?.name || '',
        brand: item.productId?.brand || '',
        price: item.productId?.price || 0,
        discount: item.productId?.discount || 0,
        image: item.productId?.images?.[0] || '',
        stock: item.productId?.stock || 0,
        quantity: item.quantity
      }));
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  } else {
    // Guest
    const cart = getLocalCart().filter(item => item.productId !== productId);
    localStorage.setItem('guestCart', JSON.stringify(cart));
    return cart;
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      localStorage.removeItem('guestCart');
      state.cartItems = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateCartQty.fulfilled, (state, action) => {
        state.cartItems = action.payload;
      })
      
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.cartItems = action.payload;
      });
  }
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
