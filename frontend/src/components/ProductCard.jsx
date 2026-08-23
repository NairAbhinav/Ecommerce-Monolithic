import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { addToCart } from '../store/slices/cartSlice.js';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Check wishlist state on mount
  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsWishlisted(wishlist.some(item => item._id === product._id));
  }, [product._id]);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (isWishlisted) {
      wishlist = wishlist.filter(item => item._id !== product._id);
      setIsWishlisted(false);
    } else {
      wishlist.push(product);
      setIsWishlisted(true);
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      dispatch(addToCart({ product, quantity: 1 }));
      // Alert/notification can be shown by App level toast
    }
  };

  // Price calculations
  const discountedPrice = Math.round(product.price - (product.price * product.discount) / 100);

  return (
    <div className="glass rounded-2xl overflow-hidden border border-slate-800/80 hover:border-blue-500/30 group transition-all duration-300 flex flex-col justify-between h-full hover:shadow-[0_10px_30px_rgba(30,41,59,0.5)]">
      {/* Product Image Panel */}
      <Link to={`/product/${product._id}`} className="relative block overflow-hidden aspect-[4/3] bg-slate-900/50">
        {/* Discount Badge */}
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500/90 text-white font-bold text-xs px-2.5 py-1 rounded-full z-10 shadow-sm animate-pulse">
            -{product.discount}% OFF
          </span>
        )}

        {/* Wishlist Heart */}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 z-10 p-2 bg-slate-900/60 hover:bg-slate-950 text-slate-300 hover:text-red-500 rounded-full backdrop-blur-md transition-colors border border-slate-800"
          title="Add to Wishlist"
        >
          <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Image */}
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=60'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Out of Stock Overly */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-dark-950/75 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-red-950/80 border border-red-500/30 text-red-400 font-bold px-4 py-2 rounded-xl text-sm uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content Panel */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{product.brand}</span>
            <span className="text-[10px] bg-slate-800/80 px-2 py-0.5 rounded-md text-slate-300">
              {product.subcategory}
            </span>
          </div>

          {/* Product Title */}
          <Link to={`/product/${product._id}`} className="block text-sm font-semibold text-slate-100 hover:text-blue-400 transition-colors line-clamp-2 min-h-[40px] mb-2">
            {product.name}
          </Link>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-3">
            <div className="flex text-amber-500">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className={`w-3.5 h-3.5 ${
                    idx < Math.round(product.ratings || 0)
                      ? 'fill-amber-500'
                      : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-400 font-medium">({product.reviewsCount || 0})</span>
          </div>
        </div>

        {/* Pricing and Action row */}
        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between mt-auto">
          {/* Price tags */}
          <div className="flex flex-col">
            {product.discount > 0 ? (
              <>
                <span className="text-xs text-slate-400 line-through">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="text-base font-bold text-white">₹{discountedPrice.toLocaleString('en-IN')}</span>
              </>
            ) : (
              <span className="text-base font-bold text-white">₹{product.price.toLocaleString('en-IN')}</span>
            )}
          </div>

          {/* Add to Cart button */}
          {product.stock > 0 ? (
            <button
              onClick={handleAddToCart}
              className="glow-btn bg-blue-600 hover:bg-blue-500 text-white rounded-xl p-2.5 transition-colors border border-blue-500/20"
              title="Add to Cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          ) : (
            <button
              className="bg-slate-800/40 text-slate-600 rounded-xl p-2.5 cursor-not-allowed border border-slate-800/30"
              disabled
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
