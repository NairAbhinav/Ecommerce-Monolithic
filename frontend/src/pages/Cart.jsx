import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { updateCartQty, deleteCartItem } from '../store/slices/cartSlice.js';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, loading } = useSelector((state) => state.cart);

  const handleQtyChange = (productId, newQty, stock) => {
    const qty = Math.max(1, Math.min(stock, newQty));
    dispatch(updateCartQty({ productId, quantity: qty }));
  };

  const handleRemoveItem = (productId) => {
    dispatch(deleteCartItem(productId));
  };

  // Calculations
  const totalOriginalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalSavings = cartItems.reduce((acc, item) => {
    const discountedPrice = item.price - (item.price * item.discount) / 100;
    return acc + (item.price - discountedPrice) * item.quantity;
  }, 0);

  const totalDiscountedPrice = totalOriginalPrice - totalSavings;
  const shippingCharges = totalDiscountedPrice > 2000 || totalDiscountedPrice === 0 ? 0 : 99;
  const finalTotalAmount = totalDiscountedPrice + shippingCharges;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Shopping Cart</h1>
        <p className="text-xs text-slate-400 mt-1">Review your selected products and checkout</p>
      </div>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ITEMS LIST COLUMN */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const discountedPrice = Math.round(item.price - (item.price * item.discount) / 100);
              return (
                <div
                  key={item.productId}
                  className="glass rounded-2xl p-4 border border-slate-900 flex flex-col sm:flex-row items-center gap-4 transition-all duration-300 hover:border-slate-800"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover bg-slate-900 border border-slate-800/80 shrink-0"
                  />

                  {/* Name and pricing */}
                  <div className="flex-grow text-center sm:text-left space-y-1">
                    <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded-md border border-blue-500/10">
                      {item.brand}
                    </span>
                    <Link to={`/product/${item.productId}`} className="block text-sm font-semibold text-white hover:text-blue-400 transition-colors line-clamp-1">
                      {item.name}
                    </Link>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-xs">
                      <span className="font-bold text-slate-200">₹{discountedPrice.toLocaleString('en-IN')}</span>
                      {item.discount > 0 && (
                        <span className="text-[10px] text-slate-500 line-through">₹{item.price.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>

                  {/* Qty and Remove controls */}
                  <div className="flex items-center gap-4 shrink-0 justify-between w-full sm:w-auto">
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg overflow-hidden h-9 w-24">
                      <button
                        onClick={() => handleQtyChange(item.productId, item.quantity - 1, item.stock)}
                        className="w-1/3 text-slate-400 hover:text-white transition-colors"
                      >
                        -
                      </button>
                      <span className="w-1/3 text-center text-xs font-bold text-slate-200">{item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(item.productId, item.quantity + 1, item.stock)}
                        className="w-1/3 text-slate-400 hover:text-white transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="p-2 text-slate-500 hover:text-red-500 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-red-500/20 rounded-xl transition-all"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TOTAL BREAKDOWN SIDEBAR */}
          <div className="space-y-6">
            <div className="glass rounded-3xl border border-slate-850 p-6 space-y-6 shadow-2xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-850 pb-3">Price Summary</h3>
              
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Price ({cartItems.length} items)</span>
                  <span>₹{totalOriginalPrice.toLocaleString('en-IN')}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount Savings</span>
                    <span>-₹{Math.round(totalSavings).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Delivery Charges</span>
                  <span>{shippingCharges === 0 ? 'FREE' : `₹${shippingCharges}`}</span>
                </div>
              </div>

              {shippingCharges > 0 && (
                <div className="text-[10px] text-blue-400 bg-blue-500/5 border border-blue-500/10 p-2.5 rounded-xl text-center">
                  💡 Shop for ₹{Math.max(0, 2000 - totalDiscountedPrice)} more to unlock free delivery!
                </div>
              )}

              <div className="border-t border-slate-850 pt-4 flex justify-between font-bold text-sm text-white">
                <span>Final Total Amount</span>
                <span className="text-base text-blue-400">₹{Math.round(finalTotalAmount).toLocaleString('en-IN')}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full glow-btn bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl text-xs flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-center">
              <Link to="/products" className="text-xs text-slate-400 hover:text-white underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Empty state view */
        <div className="glass rounded-3xl border border-slate-850 p-16 text-center max-w-lg mx-auto space-y-4">
          <div className="bg-slate-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-slate-800">
            <ShoppingBag className="w-6 h-6 text-slate-400" />
          </div>
          <h2 className="text-base font-bold text-white">Your Shopping Cart is Empty</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            It looks like you haven't added any products to your shopping cart yet. We have a massive collection of smartphones ready for you!
          </p>
          <Link
            to="/products"
            className="inline-flex bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-lg"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

export default Cart;
