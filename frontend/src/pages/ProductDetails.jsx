import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Star, ShoppingCart, CreditCard, Heart, Share2, Info, MessageSquare, AlertCircle, ChevronRight 
} from 'lucide-react';
import { fetchProductDetails, addProductReview, resetProductState } from '../store/slices/productSlice.js';
import { addToCart } from '../store/slices/cartSlice.js';
import { ProductDetailSkeleton } from '../components/LoadingSkeleton.jsx';

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { product, loading, error } = useSelector((state) => state.products);
  const { userInfo } = useSelector((state) => state.auth);

  // UI state
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [wishlistActive, setWishlistActive] = useState(false);
  const [copied, setCopied] = useState(false);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchProductDetails(id));
    return () => {
      dispatch(resetProductState());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (product) {
      setActiveImage(product.images?.[0] || '');
      
      // Check wishlist
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistActive(wishlist.some((item) => item._id === product._id));
    }
  }, [product]);

  const handleQtyChange = (val) => {
    const qty = Math.max(1, Math.min(product.stock, val));
    setQuantity(qty);
  };

  const handleAddToCart = () => {
    if (product.stock > 0) {
      dispatch(addToCart({ product, quantity }));
      alert('Product added to shopping cart!');
    }
  };

  const handleBuyNow = () => {
    if (product.stock > 0) {
      dispatch(addToCart({ product, quantity }));
      navigate('/checkout');
    }
  };

  const toggleWishlist = () => {
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (wishlistActive) {
      wishlist = wishlist.filter((item) => item._id !== product._id);
      setWishlistActive(false);
    } else {
      wishlist.push(product);
      setWishlistActive(true);
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);

    if (!comment.trim()) {
      setReviewError('Please write a review comment.');
      return;
    }

    try {
      const res = await dispatch(addProductReview({ id, rating, comment })).unwrap();
      setReviewSuccess(true);
      setComment('');
      setRating(5);
    } catch (err) {
      setReviewError(err || 'Failed to submit review.');
    }
  };

  if (loading) return <ProductDetailSkeleton />;
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white">Product Load Failed</h2>
        <p className="text-slate-400 text-xs mt-2">{error}</p>
        <button onClick={() => navigate('/products')} className="bg-slate-900 border border-slate-800 text-slate-200 text-xs px-4 py-2 mt-6 rounded-xl">
          Back to Browse
        </button>
      </div>
    );
  }
  if (!product) return null;

  const discountedPrice = Math.round(product.price - (product.price * product.discount) / 100);

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <span className="hover:text-white cursor-pointer" onClick={() => navigate('/')}>Home</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="hover:text-white cursor-pointer" onClick={() => navigate(`/products?category=${product.category}`)}>{product.category}</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-300 truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT COLUMN - Images Gallery */}
        <div className="space-y-4">
          <div className="glass rounded-3xl overflow-hidden aspect-[4/3] bg-slate-900/40 border border-slate-800 flex items-center justify-center">
            <img src={activeImage} alt={product.name} className="max-h-[400px] w-auto object-contain hover:scale-105 transition-transform duration-350" />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-16 rounded-xl border overflow-hidden shrink-0 bg-slate-900/60 transition-colors ${
                    activeImage === img
                      ? 'border-blue-500 bg-slate-900'
                      : 'border-slate-850 hover:border-slate-700'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - Spec details & Actions */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-md border border-blue-500/10">
              {product.brand}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 leading-tight">{product.name}</h1>
            
            {/* Stars */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`w-4 h-4 ${
                      idx < Math.round(product.ratings || 0)
                        ? 'fill-amber-500'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-300 font-bold">{product.ratings || 'No'} / 5</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">{product.reviewsCount || 0} reviews</span>
            </div>
          </div>

          {/* Pricing Panel */}
          <div className="glass rounded-2xl border border-slate-800/80 p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium">Special Selling Price</span>
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl font-black text-white">₹{discountedPrice.toLocaleString('en-IN')}</span>
                {product.discount > 0 && (
                  <>
                    <span className="text-sm text-slate-500 line-through">₹{product.price.toLocaleString('en-IN')}</span>
                    <span className="text-xs font-bold text-red-400">({product.discount}% OFF)</span>
                  </>
                )}
              </div>
            </div>

            {/* Stock status badge */}
            <div>
              {product.stock > 10 ? (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                  In Stock
                </span>
              ) : product.stock > 0 ? (
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full uppercase tracking-wider animate-pulse">
                  Only {product.stock} Left
                </span>
              ) : (
                <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                  Out Of Stock
                </span>
              )}
            </div>
          </div>

          {/* Color & Variant Info */}
          {product.color && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Color</h3>
              <p className="text-sm font-semibold text-slate-200">{product.color}</p>
            </div>
          )}

          {/* Buy panel controls */}
          {product.stock > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-900">
              {/* Qty controller */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quantity</span>
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl overflow-hidden w-32 h-10">
                  <button
                    onClick={() => handleQtyChange(quantity - 1)}
                    className="w-1/3 text-slate-400 hover:text-white transition-colors"
                  >
                    -
                  </button>
                  <span className="w-1/3 text-center text-sm font-bold text-slate-200">{quantity}</span>
                  <button
                    onClick={() => handleQtyChange(quantity + 1)}
                    className="w-1/3 text-slate-400 hover:text-white transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 glow-btn bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-850 hover:text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 glow-btn bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 shadow-lg"
                >
                  <CreditCard className="w-4 h-4" /> Buy Now
                </button>
              </div>
            </div>
          )}

          {/* Meta triggers */}
          <div className="flex gap-4 pt-4 border-t border-slate-900">
            <button
              onClick={toggleWishlist}
              className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                wishlistActive ? 'text-red-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlistActive ? 'fill-red-500' : ''}`} />
              {wishlistActive ? 'Wishlisted' : 'Add to Wishlist'}
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              {copied ? 'Link Copied!' : 'Share Product'}
            </button>
          </div>
        </div>
      </div>

      {/* Specifications details sheet */}
      {product.category === 'Mobile Phones' && product.specifications && (
        <section className="glass rounded-3xl p-6 border border-slate-800/80 space-y-6">
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" /> Technical Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            {Object.entries(product.specifications).map(([key, val]) => {
              if (val === 'N/A' || !val) return null;
              return (
                <div key={key} className="flex justify-between py-2 border-b border-slate-900 text-xs">
                  <span className="capitalize font-medium text-slate-400">{key}</span>
                  <span className="font-semibold text-slate-200 text-right">{val}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Description sheet */}
      <section className="glass rounded-3xl p-6 border border-slate-800/80 space-y-3">
        <h2 className="text-lg font-extrabold text-white">Product Description</h2>
        <p className="text-xs text-slate-400 leading-relaxed">{product.description}</p>
      </section>

      {/* REVIEWS SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Review statistics and form */}
        <div className="space-y-6">
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" /> Customer Reviews
          </h2>

          <div className="glass rounded-2xl p-5 border border-slate-850 space-y-4 text-center">
            <h3 className="text-2xl font-black text-white">{product.ratings || 'No'} / 5</h3>
            <div className="flex justify-center text-amber-500">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className={`w-4 h-4 ${
                    idx < Math.round(product.ratings || 0)
                      ? 'fill-amber-500'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-400">Based on {product.reviewsCount || 0} customer reviews</p>
          </div>

          {/* Add Review Form */}
          {userInfo && userInfo.role === 'customer' && (
            <div className="glass rounded-2xl p-5 border border-slate-800/80 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Write a Review</h3>
              
              {reviewSuccess && (
                <p className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                  Review submitted successfully!
                </p>
              )}

              {reviewError && (
                <p className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl">
                  {reviewError}
                </p>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Rating Stars</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 - Good)</option>
                    <option value={3}>⭐⭐⭐ (3 - Average)</option>
                    <option value={2}>⭐⭐ (2 - Poor)</option>
                    <option value={1}>⭐ (1 - Terrible)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Comments</label>
                  <textarea
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe your experience with this device..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 rounded-xl text-xs transition-colors"
                >
                  Submit Review
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: List of reviews */}
        <div className="lg:col-span-2 space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev) => (
              <div key={rev._id} className="glass rounded-2xl p-4 border border-slate-900 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{rev.userName}</h4>
                    <span className="text-[10px] text-slate-500">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Stars badge */}
                  <div className="flex text-amber-500 bg-amber-500/5 px-2 py-1 rounded-lg border border-amber-500/10">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="w-3 h-3 fill-amber-500" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              No reviews written yet. Be the first to share your experience!
            </div>
          )}
        </div>

      </section>

    </div>
  );
};

export default ProductDetails;
