import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [orderItemSchema],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: { type: String, required: true }, // 'COD' or 'Card'
  paymentStatus: { 
    type: String, 
    required: true, 
    enum: ['Pending', 'Paid', 'Failed'], 
    default: 'Pending' 
  },
  paymentId: { type: String },
  totalAmount: { type: Number, required: true },
  orderStatus: { 
    type: String, 
    required: true, 
    enum: ['Processing', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled'],
    default: 'Processing' 
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
