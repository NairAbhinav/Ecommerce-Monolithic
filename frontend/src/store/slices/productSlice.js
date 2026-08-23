import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

const initialState = {
  products: [],
  product: null,
  loading: false,
  error: null,
  page: 1,
  pages: 1,
  totalProducts: 0,
  success: false // for creation/edit actions
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (queryParams, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(queryParams).toString();
      const { data } = await api.get(`/products?${queryString}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'products/fetchProductDetails',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/products/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addProductReview = createAsyncThunk(
  'products/addProductReview',
  async ({ id, rating, comment }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/products/${id}/reviews`, { rating, comment });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    resetProductState: (state) => {
      state.success = false;
      state.error = null;
      state.product = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.totalProducts = action.payload.totalProducts;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Details
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.product = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(p => p._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Review
      .addCase(addProductReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProductReview.fulfilled, (state, action) => {
        state.loading = false;
        if (state.product) {
          state.product.reviews = [action.payload.review, ...(state.product.reviews || [])];
        }
      })
      .addCase(addProductReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetProductState } = productSlice.actions;
export default productSlice.reducer;
