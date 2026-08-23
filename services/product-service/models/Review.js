import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  userName: { type: String, required: true }
}, {
  timestamps: true
});

// Update product rating average after a new review
reviewSchema.post('save', async function () {
  const Product = mongoose.model('Product');
  const reviews = await this.constructor.find({ productId: this.productId });
  
  const reviewsCount = reviews.length;
  const averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviewsCount;

  await Product.findByIdAndUpdate(this.productId, {
    ratings: Math.round(averageRating * 10) / 10,
    reviewsCount
  });
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
