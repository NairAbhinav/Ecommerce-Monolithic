import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Package, Plus, Settings, Trash2, Edit3, ShoppingBag, 
  Sparkles, Layers, ListFilter, AlertCircle, Info, FilePlus 
} from 'lucide-react';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../store/slices/productSlice.js';
import api from '../../utils/api.js';

const SellerDashboard = () => {
  const dispatch = useDispatch();

  const { products, loading } = useSelector((state) => state.products);
  const { userInfo } = useSelector((state) => state.auth);

  // Tab controller: 'list' | 'add' | 'edit' | 'orders'
  const [activeTab, setActiveTab] = useState('list');
  const [editProductData, setEditProductData] = useState(null);
  
  // Custom states for orders
  const [sellerOrders, setSellerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Add/Edit Product form states
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'Mobile Phones',
    subcategory: '',
    description: '',
    price: '',
    discount: '0',
    stock: '5',
    color: '',
    display: '',
    processor: '',
    ram: '',
    storage: '',
    camera: '',
    battery: '',
    os: '',
    charging: '',
    network: ''
  });

  const [images, setImages] = useState([]);

  useEffect(() => {
    // Fetch products belonging to this seller
    if (userInfo) {
      dispatch(fetchProducts({ limit: 100 })); // load all
      loadSellerOrders();
    }
  }, [dispatch, userInfo]);

  const loadSellerOrders = async () => {
    try {
      setOrdersLoading(true);
      const { data } = await api.get('/orders');
      setSellerOrders(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    setImages(e.target.files);
  };

  // Switch to Edit Mode
  const triggerEditMode = (prod) => {
    setEditProductData(prod);
    setFormData({
      name: prod.name,
      brand: prod.brand,
      category: prod.category,
      subcategory: prod.subcategory,
      description: prod.description,
      price: prod.price.toString(),
      discount: (prod.discount || 0).toString(),
      stock: prod.stock.toString(),
      color: prod.color || '',
      display: prod.specifications?.display || '',
      processor: prod.specifications?.processor || '',
      ram: prod.specifications?.ram || '',
      storage: prod.specifications?.storage || '',
      camera: prod.specifications?.camera || '',
      battery: prod.specifications?.battery || '',
      os: prod.specifications?.os || '',
      charging: prod.specifications?.charging || '',
      network: prod.specifications?.network || ''
    });
    setActiveTab('edit');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const productPayload = new FormData();
    Object.keys(formData).forEach((key) => {
      productPayload.append(key, formData[key]);
    });

    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        productPayload.append('images', images[i]);
      }
    }

    try {
      if (activeTab === 'add') {
        await dispatch(createProduct(productPayload)).unwrap();
        alert('Product added successfully!');
      } else if (activeTab === 'edit') {
        await dispatch(updateProduct({ id: editProductData._id, formData: productPayload })).unwrap();
        alert('Product updated successfully!');
      }
      
      // Reset form
      setFormData({
        name: '', brand: '', category: 'Mobile Phones', subcategory: '', description: '',
        price: '', discount: '0', stock: '5', color: '', display: '', processor: '',
        ram: '', storage: '', camera: '', battery: '', os: '', charging: '', network: ''
      });
      setImages([]);
      setEditProductData(null);
      setActiveTab('list');
      dispatch(fetchProducts({ limit: 100 }));
    } catch (err) {
      alert(err || 'Operation failed');
    }
  };

  const handleDelete = async (prodId) => {
    if (window.confirm('Are you sure you want to remove this product?')) {
      try {
        await dispatch(deleteProduct(prodId)).unwrap();
        alert('Product removed');
      } catch (err) {
        alert(err || 'Failed to remove product');
      }
    }
  };

  // Filter products by seller id to ensure they only view their own inventory
  const sellerProducts = products.filter(p => p.sellerId === userInfo?._id || p.sellerId?._id === userInfo?._id);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Merchant Dashboard</h1>
        <p className="text-xs text-slate-400 mt-1">Manage catalog listings, stock controls, and customer transactions</p>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-900 gap-2 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'list' ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          Active Listings ({sellerProducts.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('add');
            setEditProductData(null);
            setFormData({
              name: '', brand: '', category: 'Mobile Phones', subcategory: '', description: '',
              price: '', discount: '0', stock: '5', color: '', display: '', processor: '',
              ram: '', storage: '', camera: '', battery: '', os: '', charging: '', network: ''
            });
          }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 ${
            activeTab === 'add' ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FilePlus className="w-4 h-4" /> Add Product
        </button>
        <button
          onClick={() => { setActiveTab('orders'); loadSellerOrders(); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'orders' ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          Incoming Orders ({sellerOrders.length})
        </button>
      </div>

      {/* TAB CONTENT: Listings */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {sellerProducts.length > 0 ? (
            <div className="glass rounded-2xl border border-slate-900 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-900/30 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-4">Item Details</th>
                      <th className="p-4">Brand</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price (₹)</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellerProducts.map((prod) => (
                      <tr key={prod._id} className="border-b border-slate-900/50 hover:bg-slate-900/30 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img src={prod.images?.[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-900" />
                          <div>
                            <p className="font-semibold text-slate-200 line-clamp-1">{prod.name}</p>
                            <p className="text-[10px] text-slate-500">ID: {prod._id}</p>
                          </div>
                        </td>
                        <td className="p-4 text-slate-350">{prod.brand}</td>
                        <td className="p-4 text-slate-350">
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300">{prod.subcategory}</span>
                        </td>
                        <td className="p-4 text-slate-200 font-bold">
                          {prod.price.toLocaleString('en-IN')}
                          {prod.discount > 0 && <span className="text-[10px] text-red-400 ml-1">-{prod.discount}%</span>}
                        </td>
                        <td className="p-4">
                          <span className={`font-semibold ${prod.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{prod.stock} left</span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => triggerEditMode(prod)}
                              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-500/10"
                              title="Edit item"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(prod._id)}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/10"
                              title="Delete item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl border border-slate-900 p-12 text-center text-xs text-slate-500 max-w-md mx-auto space-y-3">
              <Package className="w-10 h-10 text-slate-600 mx-auto" />
              <h2 className="text-sm font-bold text-white">No active listings</h2>
              <p className="leading-relaxed">Add mobile phones or accessories to get started selling on this platform.</p>
              <button
                onClick={() => setActiveTab('add')}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Add Your First Product
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Add & Edit Product Forms */}
      {(activeTab === 'add' || activeTab === 'edit') && (
        <form onSubmit={handleFormSubmit} className="glass rounded-2xl border border-slate-900 p-6 space-y-6 max-w-3xl mx-auto shadow-2xl">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-3">
            {activeTab === 'add' ? 'Add New Product Listing' : `Edit Listing: ${editProductData?.name}`}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-slate-400">Product Title</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400">Brand Name</label>
              <input
                type="text"
                name="brand"
                required
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="e.g. Apple, Samsung"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400">Sub-category</label>
              <input
                type="text"
                name="subcategory"
                required
                value={formData.subcategory}
                onChange={handleInputChange}
                placeholder="e.g. Apple iPhone, Chargers, Headphones"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400">Main Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 outline-none"
              >
                <option value="Mobile Phones">Mobile Phones</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400">Color Variant</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="e.g. Titanium Black"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 sm:col-span-2">
              <div className="space-y-1.5">
                <label className="text-slate-400">Price (INR)</label>
                <input
                  type="number"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400">Discount (%)</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400">Stock Count</label>
                <input
                  type="number"
                  name="stock"
                  required
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-slate-400">Description</label>
              <textarea
                name="description"
                required
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none"
              ></textarea>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-slate-400">Upload Product Images (Max 5)</label>
              <input
                type="file"
                multiple
                onChange={handleImageChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-450 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* specifications inputs panel - Only for Mobile Phones */}
          {formData.category === 'Mobile Phones' && (
            <div className="pt-4 border-t border-slate-900 space-y-4">
              <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4.5 h-4.5 text-blue-400" /> Device Specifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400">Display Size</label>
                  <input
                    type="text"
                    name="display"
                    value={formData.display}
                    onChange={handleInputChange}
                    placeholder="e.g. 6.7-inch OLED"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Processor</label>
                  <input
                    type="text"
                    name="processor"
                    value={formData.processor}
                    onChange={handleInputChange}
                    placeholder="e.g. Snapdragon 8 Gen 3"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">RAM Capacity</label>
                  <input
                    type="text"
                    name="ram"
                    value={formData.ram}
                    onChange={handleInputChange}
                    placeholder="e.g. 12GB"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Internal Storage</label>
                  <input
                    type="text"
                    name="storage"
                    value={formData.storage}
                    onChange={handleInputChange}
                    placeholder="e.g. 256GB"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Camera Megapixels</label>
                  <input
                    type="text"
                    name="camera"
                    value={formData.camera}
                    onChange={handleInputChange}
                    placeholder="e.g. 108MP + 12MP"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Battery Capacity</label>
                  <input
                    type="text"
                    name="battery"
                    value={formData.battery}
                    onChange={handleInputChange}
                    placeholder="e.g. 5000 mAh"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Operating System</label>
                  <input
                    type="text"
                    name="os"
                    value={formData.os}
                    onChange={handleInputChange}
                    placeholder="e.g. Android 14"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Charging Speed</label>
                  <input
                    type="text"
                    name="charging"
                    value={formData.charging}
                    onChange={handleInputChange}
                    placeholder="e.g. 45W Fast charging"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Network Tech</label>
                  <input
                    type="text"
                    name="network"
                    value={formData.network}
                    onChange={handleInputChange}
                    placeholder="e.g. 5G, Wi-Fi 6"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className="w-1/2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold py-2.5 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl shadow-lg"
            >
              {activeTab === 'add' ? 'Post Product Listing' : 'Save Product Updates'}
            </button>
          </div>
        </form>
      )}

      {/* TAB CONTENT: Incoming Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {ordersLoading ? (
            <div className="text-center py-6 text-slate-400 text-xs animate-pulse">Loading orders...</div>
          ) : sellerOrders.length > 0 ? (
            <div className="space-y-4">
              <div className="glass rounded-xl p-4 border border-slate-850 flex items-center justify-between text-xs">
                <span className="text-slate-400">💡 Merchant order status updates will sync with customer email notices instantly.</span>
                <Link to="/orders" className="text-blue-400 hover:underline font-bold shrink-0">Unified Tracking Page →</Link>
              </div>

              <div className="glass rounded-2xl border border-slate-900 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-900/30 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Total Amount (₹)</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellerOrders.map((ord) => (
                      <tr key={ord._id} className="border-b border-slate-900/50 hover:bg-slate-900/30">
                        <td className="p-4 font-mono text-[10px] text-slate-400">#{ord._id}</td>
                        <td className="p-4 text-slate-200 font-medium">
                          <p>{ord.userId?.name || 'Customer'}</p>
                          <p className="text-[10px] text-slate-500">{ord.userId?.email}</p>
                        </td>
                        <td className="p-4 text-slate-200 font-bold">₹{ord.totalAmount.toLocaleString('en-IN')}</td>
                        <td className="p-4 text-slate-300">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${ord.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-450 border border-amber-500/20'}`}>
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`font-semibold ${ord.orderStatus === 'Delivered' ? 'text-emerald-450' : ord.orderStatus === 'Cancelled' ? 'text-red-400' : 'text-blue-400'}`}>
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="p-4 text-right text-slate-500">{new Date(ord.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl border border-slate-900 p-12 text-center text-xs text-slate-500 max-w-md mx-auto space-y-2">
              <ShoppingBag className="w-10 h-10 text-slate-650 mx-auto" />
              <h2 className="text-sm font-bold text-white">No Customer Orders</h2>
              <p className="leading-relaxed">Customers haven't purchased items belonging to your catalog yet. Keep updating pricing to stay competitive!</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default SellerDashboard;
