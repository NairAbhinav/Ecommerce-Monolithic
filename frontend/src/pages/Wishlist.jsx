import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';
import { addToCart } from '../store/slices/cartSlice.js';

const Wishlist = () => {
  const dispatch = useDispatch();
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlistItems(list);
  }, []);

  const handleRemove = (productId) => {
    const updated = wishlistItems.filter((item) => item._id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    setWishlistItems(updated);
  };

  const handleAddToCart = (product) => {
    if (product.stock > 0) {
      dispatch(addToCart({ product, quantity: 1 }));
      alert('Product added to shopping cart!');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">My Wishlist</h1>
        <p className="text-xs text-slate-400 mt-1">Review items you saved for later purchase</p>
      </div>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => {
            const discountedPrice = Math.round(item.price - (item.price * item.discount) / 100);
            return (
              <div
                key={item._id}
                className="glass rounded-2xl overflow-hidden border border-slate-900 transition-all hover:border-slate-800 flex flex-col justify-between h-full group"
              >
                {/* Image */}
                <div className="relative overflow-hidden aspect-[4/3] bg-slate-900/50">
                  <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350" />
                  
                  {/* Delete button */}
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="absolute top-3 right-3 z-10 p-2 bg-slate-950/70 hover:bg-slate-950 text-slate-400 hover:text-red-400 border border-slate-900 rounded-full"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Content info */}
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-450 uppercase font-semibold">{item.brand}</span>
                    <Link to={`/product/${item._id}`} className="block text-sm font-semibold text-white hover:text-blue-400 line-clamp-2 min-h-[40px]">
                      {item.name}
                    </Link>
                  </div>

                  {/* Price & Actions Row */}
                  <div className="pt-3 mt-4 border-t border-slate-900 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 line-through">₹{item.price.toLocaleString('en-IN')}</span>
                      <p className="text-sm font-bold text-white">₹{discountedPrice.toLocaleString('en-IN')}</p>
                    </div>

                    {item.stock > 0 ? (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="glow-btn bg-blue-600 hover:bg-blue-500 text-white rounded-xl p-2.5 transition-colors"
                        title="Add to Cart"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[10px] bg-red-950/60 border border-red-500/20 text-red-400 font-bold px-2 py-1 rounded-lg uppercase">
                        Out of stock
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty wishlist view */
        <div className="glass rounded-3xl border border-slate-850 p-16 text-center max-w-lg mx-auto space-y-4">
          <div className="bg-slate-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-slate-800">
            <Heart className="w-6 h-6 text-slate-450" />
          </div>
          <h2 className="text-base font-bold text-white">Your Wishlist is Empty</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            You haven't bookmarked any smartphones or accessories yet. Find items you like and add them to your wishlist!
          </p>
          <Link
            to="/products"
            className="inline-flex bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-lg"
          >
            Start Browsing
          </Link>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
