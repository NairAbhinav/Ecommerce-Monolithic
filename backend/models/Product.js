import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Mobile Phones', 'Accessories']
  },
  subcategory: { type: String, required: true }, // e.g. 'Smart Watch', 'Apple iPhone', 'Chargers'
  description: { type: String, required: true },
  images: [{ type: String }],
  price: { type: Number, required: true, default: 0 },
  discount: { type: Number, default: 0 }, // Discount in percentage
  specifications: {
    display: { type: String },
    processor: { type: String },
    ram: { type: String },      // e.g. '8GB', '12GB'
    storage: { type: String },  // e.g. '128GB', '256GB'
    camera: { type: String },
    battery: { type: String },
    os: { type: String },       // e.g. 'iOS', 'Android'
    charging: { type: String },
    network: { type: String }
  },
  color: { type: String },      // e.g. 'Black', 'Titanium Grey'
  stock: { type: Number, required: true, default: 0 },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ratings: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;
