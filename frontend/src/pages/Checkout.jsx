import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { CreditCard, Truck, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { placeOrder, resetOrderState } from '../store/slices/orderSlice.js';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const { success, error, currentOrder, loading } = useSelector((state) => state.orders);

  // Form details
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card'); // 'Card' or 'COD'

  // Card details (mocked)
  const [cardInfo, setCardInfo] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  // Processing payment overlay
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1); // 1 = input, 2 = processing, 3 = success

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !success) {
      navigate('/cart');
    }
    // Populate default address if user profile has one
    if (userInfo && userInfo.addresses && userInfo.addresses.length > 0) {
      const defAddr = userInfo.addresses.find(a => a.isDefault) || userInfo.addresses[0];
      setShippingAddress({
        street: defAddr.street,
        city: defAddr.city,
        state: defAddr.state,
        zipCode: defAddr.zipCode,
        country: defAddr.country || 'India'
      });
      setPhone(userInfo.phone || '');
    }
  }, [cartItems, userInfo, navigate, success]);

  // Handle successful placement
  useEffect(() => {
    if (success && currentOrder) {
      dispatch(resetOrderState());
      navigate('/orders');
    }
  }, [success, currentOrder, dispatch, navigate]);

  const handleAddressChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handleCardChange = (e) => {
    setCardInfo({
      ...cardInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      alert('Please fill in all shipping address fields.');
      return;
    }

    if (!phone) {
      alert('Please provide a contact phone number.');
      return;
    }

    const orderData = {
      products: cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: Math.round(item.price - (item.price * item.discount) / 100),
        image: item.image
      })),
      shippingAddress,
      paymentMethod,
      totalAmount: finalTotalAmount,
      paymentId: paymentMethod === 'Card' ? `ch_mock_${Date.now()}` : undefined
    };

    if (paymentMethod === 'Card') {
      // Trigger checkout payment modal simulation
      setPaymentModalOpen(true);
      setPaymentStep(2); // Start processing
      
      setTimeout(() => {
        setPaymentStep(3); // Success
        setTimeout(() => {
          setPaymentModalOpen(false);
          dispatch(placeOrder(orderData));
        }, 1500);
      }, 2000);
    } else {
      // COD directly places order
      dispatch(placeOrder(orderData));
    }
  };

  // Calculations
  const totalOriginalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalSavings = cartItems.reduce((acc, item) => {
    const discountedPrice = item.price - (item.price * item.discount) / 100;
    return acc + (item.price - discountedPrice) * item.quantity;
  }, 0);

  const totalDiscountedPrice = totalOriginalPrice - totalSavings;
  const shippingCharges = totalDiscountedPrice > 2000 ? 0 : 99;
  const finalTotalAmount = Math.round(totalDiscountedPrice + shippingCharges);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 relative">
      
      <div>
        <h1 className="text-2xl font-black text-white">Checkout</h1>
        <p className="text-xs text-slate-400 mt-1">Provide shipping address and finalize payment details</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SHIPPNG & PAYMENT DETAILS PANEL */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Shipping Details */}
          <div className="glass rounded-2xl p-6 border border-slate-900 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-400" /> Delivery Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Street / House Address</label>
                <input
                  type="text"
                  name="street"
                  required
                  value={shippingAddress.street}
                  onChange={handleAddressChange}
                  placeholder="Apartment name, building number, street locality..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={shippingAddress.city}
                  onChange={handleAddressChange}
                  placeholder="e.g. Mumbai"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">State</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={shippingAddress.state}
                  onChange={handleAddressChange}
                  placeholder="e.g. Maharashtra"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">ZIP / Postal Code</label>
                <input
                  type="text"
                  name="zipCode"
                  required
                  value={shippingAddress.zipCode}
                  onChange={handleAddressChange}
                  placeholder="e.g. 400001"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="glass rounded-2xl p-6 border border-slate-900 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" /> Payment Option
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card toggle */}
              <label className={`glass border rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                paymentMethod === 'Card' ? 'border-blue-500 bg-blue-500/5' : 'border-slate-850 hover:bg-slate-900'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Card'}
                  onChange={() => setPaymentMethod('Card')}
                  className="w-4 h-4 text-blue-600 focus:ring-0"
                />
                <div>
                  <h3 className="text-xs font-bold text-white">Credit / Debit Card</h3>
                  <p className="text-[10px] text-slate-400">Pay using Visa/Mastercard/Stripe</p>
                </div>
              </label>

              {/* COD toggle */}
              <label className={`glass border rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                paymentMethod === 'COD' ? 'border-blue-500 bg-blue-500/5' : 'border-slate-850 hover:bg-slate-900'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="w-4 h-4 text-blue-600 focus:ring-0"
                />
                <div>
                  <h3 className="text-xs font-bold text-white">Cash on Delivery</h3>
                  <p className="text-[10px] text-slate-400">Pay inside home upon parcel arrival</p>
                </div>
              </label>
            </div>

            {/* Credit Card Input details */}
            {paymentMethod === 'Card' && (
              <div className="pt-4 border-t border-slate-900 space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Card Number</label>
                    <input
                      type="text"
                      name="number"
                      required={paymentMethod === 'Card'}
                      value={cardInfo.number}
                      onChange={handleCardChange}
                      placeholder="4242 •••• •••• 4242"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Expiration Date</label>
                    <input
                      type="text"
                      name="expiry"
                      required={paymentMethod === 'Card'}
                      value={cardInfo.expiry}
                      onChange={handleCardChange}
                      placeholder="MM/YY"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">CVV / Security Code</label>
                    <input
                      type="password"
                      name="cvv"
                      required={paymentMethod === 'Card'}
                      value={cardInfo.cvv}
                      onChange={handleCardChange}
                      placeholder="•••"
                      maxLength="3"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ORDER SUMMARY SIDEBAR PANEL */}
        <div className="space-y-6">
          <div className="glass rounded-3xl border border-slate-850 p-6 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-850 pb-3">Order Summary</h3>

            {/* Items display */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex justify-between items-center gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover bg-slate-900" />
                    <div>
                      <h4 className="font-semibold text-slate-200 line-clamp-1 max-w-[120px]">{item.name}</h4>
                      <p className="text-[10px] text-slate-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-300">
                    ₹{(Math.round(item.price - (item.price * item.discount) / 100) * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Panel */}
            <div className="border-t border-slate-850 pt-4 space-y-3.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal</span>
                <span>₹{totalOriginalPrice.toLocaleString('en-IN')}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Savings Savings</span>
                  <span>-₹{Math.round(totalSavings).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Shipping Fee</span>
                <span>{shippingCharges === 0 ? 'FREE' : `₹${shippingCharges}`}</span>
              </div>

              <div className="border-t border-slate-850 pt-4 flex justify-between font-bold text-sm text-white">
                <span>Total Amount Due</span>
                <span className="text-base text-blue-400">₹{finalTotalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full glow-btn bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl text-xs flex items-center justify-center gap-2"
            >
              {loading ? 'Processing Order...' : `Place Order (₹${finalTotalAmount.toLocaleString('en-IN')})`}
            </button>
          </div>
        </div>
      </form>

      {/* STRIPE/RAZORPAY PAYMENT SIMULATION MODAL */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-dark-950/85 backdrop-blur-md"></div>
          
          <div className="relative glass rounded-3xl p-8 max-w-sm w-full border border-slate-850 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {paymentStep === 2 ? (
              <>
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                <h3 className="text-base font-extrabold text-white">Contacting Payment Gateway...</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Securing payment token using mock Stripe server. Do not close or refresh this browser.
                </p>
              </>
            ) : (
              <>
                <div className="bg-emerald-500/15 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 animate-bounce">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-base font-extrabold text-white">Transaction Success</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Receipt #rc_{Date.now().toString().slice(-6)} generated successfully. Placing your order now!
                </p>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;
