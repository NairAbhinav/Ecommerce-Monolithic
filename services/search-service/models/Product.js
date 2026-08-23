import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { 
    type: String, 
    required: true
  },
  subcategory: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  price: { type: Number, required: true, default: 0 },
  discount: { type: Number, default: 0 },
  specifications: {
    display: { type: String },
    processor: { type: String },
    ram: { type: String },
    storage: { type: String },
    camera: { type: String },
    battery: { type: String },
    os: { type: String },
    charging: { type: String },
    network: { type: String }
  },
  color: { type: String },
  stock: { type: Number, required: true, default: 0 },
  sellerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  ratings: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;
