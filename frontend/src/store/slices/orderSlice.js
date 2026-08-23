import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';
import { clearCart } from './cartSlice.js';

const initialState = {
  orders: [],
  loading: false,
  error: null,
  success: false,
  currentOrder: null
};

export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderData, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.post('/orders', orderData);
      dispatch(clearCart());
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/orders');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, orderStatus, paymentStatus }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/orders/${id}`, { orderStatus, paymentStatus });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.success = false;
      state.error = null;
      state.currentOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Place Order
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentOrder = action.payload;
        state.orders = [action.payload, ...state.orders];
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Fetch Orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Order Status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o._id === action.payload._id);
        if (index > -1) {
          state.orders[index] = action.payload;
        }
      });
  }
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
