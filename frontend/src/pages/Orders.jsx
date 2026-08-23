import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, Calendar, CheckCircle2, Truck, Package, Clock, AlertCircle } from 'lucide-react';
import { fetchMyOrders, updateOrderStatus } from '../store/slices/orderSlice.js';

const STAGES = ['Processing', 'Shipped', 'Out for delivery', 'Delivered'];

const Orders = () => {
  const dispatch = useDispatch();

  const { orders, loading, error } = useSelector((state) => state.orders);
  const { userInfo } = useSelector((state) => state.auth);

  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await dispatch(updateOrderStatus({ id: orderId, orderStatus: newStatus })).unwrap();
    } catch (err) {
      alert(err || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStageIndex = (status) => {
    return STAGES.indexOf(status);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Processing': return <Clock className="w-4 h-4 text-amber-400" />;
      case 'Shipped': return <Package className="w-4 h-4 text-blue-400" />;
      case 'Out for delivery': return <Truck className="w-4 h-4 text-indigo-400" />;
      case 'Delivered': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default: return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">
          {userInfo?.role === 'customer' ? 'My Purchases' : 'Manage Customer Orders'}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {userInfo?.role === 'customer' 
            ? 'Track active shipments and browse purchase logs' 
            : 'View incoming orders and update delivery status'}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-44 bg-slate-900 rounded-2xl border border-slate-800"></div>
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => {
            const activeIndex = getStageIndex(order.orderStatus);
            const isCancelled = order.orderStatus === 'Cancelled';
            
            return (
              <div
                key={order._id}
                className="glass rounded-2xl border border-slate-900 p-6 space-y-6 transition-all hover:border-slate-800"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-900">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono">ORDER #{order._id}</span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 text-slate-400"><Calendar className="w-3.5 h-3.5" /> {new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                      {userInfo?.role !== 'customer' && (
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                          Buyer: {order.userId?.name || 'Customer'} ({order.userId?.email})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status label / edit select */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                      {getStatusIcon(order.orderStatus)}
                      <span>{order.orderStatus}</span>
                    </div>

                    {/* Status updater for Seller/Admin */}
                    {userInfo && userInfo.role !== 'customer' && (
                      <select
                        disabled={updatingId === order._id || isCancelled}
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-xs text-slate-300 px-2.5 py-1.5 rounded-xl outline-none"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for delivery">Out for delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Products ordered grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Items Ordered</h3>
                    <div className="space-y-2">
                      {order.products.map((p, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-900" />
                            <div>
                              <h4 className="font-semibold text-slate-200 line-clamp-1 max-w-[150px]">{p.name}</h4>
                              <p className="text-[10px] text-slate-500">Qty: {p.quantity} • ₹{p.price.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                          <span className="font-bold text-slate-300">₹{(p.price * p.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary & Shipping Details */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Payment Summary</h4>
                      <p className="font-bold text-blue-400 text-sm">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-slate-500">Method: {order.paymentMethod}</p>
                      <p className="text-[10px] text-slate-500">Status: <span className={order.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}>{order.paymentStatus}</span></p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Shipping Details</h4>
                      <p className="text-slate-300 font-semibold">{order.shippingAddress?.street}</p>
                      <p className="text-slate-400">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zipCode}</p>
                    </div>
                  </div>
                </div>

                {/* TRACKER TIMELINE COMPONENT (Only for non-cancelled orders) */}
                {!isCancelled ? (
                  <div className="pt-4 border-t border-slate-900 space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shipment Pipeline</h3>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
                      
                      {/* Connection bar (Desktop) */}
                      <div className="hidden sm:block absolute left-4 right-4 top-4.5 h-0.5 bg-slate-900 z-0">
                        <div
                          className="h-full bg-blue-600 transition-all duration-500"
                          style={{ width: `${(activeIndex / (STAGES.length - 1)) * 100}%` }}
                        ></div>
                      </div>

                      {STAGES.map((stage, idx) => {
                        const isDone = idx <= activeIndex;
                        const isCurrent = idx === activeIndex;

                        return (
                          <div key={stage} className="flex sm:flex-col items-center gap-3 sm:gap-2 z-10 flex-1 w-full text-left sm:text-center">
                            {/* Bullet */}
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center border font-bold text-xs shrink-0 transition-colors ${
                              isDone
                                ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                                : 'bg-slate-950 border-slate-850 text-slate-500'
                            }`}>
                              {idx + 1}
                            </div>
                            
                            {/* Stage Label */}
                            <div>
                              <p className={`text-xs font-semibold ${isDone ? 'text-slate-200' : 'text-slate-500'}`}>{stage}</p>
                              {isCurrent && <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Active</span>}
                            </div>
                          </div>
                        );
                      })}

                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-slate-900 bg-red-950/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-2 text-xs text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>This order has been cancelled. If payment was deduct, refunds will process back to source method in 5-7 business days.</span>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Purchases Screen */
        <div className="glass rounded-3xl border border-slate-850 p-16 text-center max-w-lg mx-auto space-y-4">
          <div className="bg-slate-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-slate-800">
            <ShoppingBag className="w-6 h-6 text-slate-400" />
          </div>
          <h2 className="text-base font-bold text-white">No Orders Placed Yet</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            You don't have any purchase records inside this account. Let's make your first smartphone purchase today!
          </p>
        </div>
      )}
    </div>
  );
};

export default Orders;
