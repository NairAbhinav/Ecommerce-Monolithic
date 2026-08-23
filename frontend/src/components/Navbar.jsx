import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ShoppingCart, Heart, User, Search, LogOut, Menu, X, 
  ChevronDown, LayoutDashboard, ShoppingBag, History, Settings 
} from 'lucide-react';
import { logout } from '../store/slices/authSlice.js';
import { fetchCart } from '../store/slices/cartSlice.js';
import api from '../utils/api.js';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Search suggestions and recent searches
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch cart on mount and when user logs in/out
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch, userInfo]);

  // Load recent searches from localStorage
  useEffect(() => {
    const recents = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recents);
  }, []);

  // Fetch auto suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const { data } = await api.get(`/products?limit=5&search=${searchQuery}`);
          setSuggestions(data.products || []);
        } catch (error) {
          console.error(error);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync state with url query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('search') || '');
  }, [location]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      // Save search query to recents
      let recents = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      recents = [searchQuery, ...recents.filter(q => q !== searchQuery)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(recents));
      setRecentSearches(recents);
      
      setShowSuggestions(false);
      setMobileMenuOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (prodId) => {
    setShowSuggestions(false);
    setSearchQuery('');
    setMobileMenuOpen(false);
    navigate(`/product/${prodId}`);
  };

  const handleRecentClick = (query) => {
    setSearchQuery(query);
    setShowSuggestions(false);
    setMobileMenuOpen(false);
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    dispatch(logout());
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="glass sticky top-0 z-50 border-b border-slate-800/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500">
                ELECTROPHONIC
              </span>
            </Link>
          </div>

          {/* Search bar - Desktop */}
          <div ref={searchRef} className="hidden md:flex flex-grow max-w-xl relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Search phones, chargers, smart watches..."
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-blue-500 text-slate-100 rounded-2xl pl-10 pr-4 py-2 text-sm focus:outline-none transition-colors"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              <Search className="absolute left-3.5 top-2.5 text-slate-500 w-4.5 h-4.5" />
            </form>

            {/* Auto Suggestions Panel */}
            {showSuggestions && (searchQuery.trim().length > 1 || recentSearches.length > 0) && (
              <div className="absolute top-12 left-0 right-0 glass rounded-2xl border border-slate-800 p-3 shadow-2xl backdrop-blur-2xl">
                {/* Recent Searches */}
                {recentSearches.length > 0 && searchQuery.trim().length <= 1 && (
                  <div className="mb-2">
                    <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-1.5 px-2">Recent Searches</p>
                    <div className="flex flex-wrap gap-2 px-2">
                      {recentSearches.map((query, index) => (
                        <button
                          key={index}
                          onClick={() => handleRecentClick(query)}
                          className="text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full border border-slate-700/50 transition-colors"
                        >
                          {query}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions List */}
                {suggestions.length > 0 ? (
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-1.5 px-2">Suggestions</p>
                    <div className="space-y-1">
                      {suggestions.map((item) => (
                        <button
                          key={item._id}
                          onClick={() => handleSuggestionClick(item._id)}
                          className="w-full text-left flex items-center gap-3 hover:bg-slate-800/60 p-2 rounded-xl transition-colors group"
                        >
                          <img src={item.images?.[0]} alt="" className="w-8 h-8 rounded-lg object-cover" />
                          <div>
                            <p className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-1">{item.name}</p>
                            <p className="text-[10px] text-slate-400">{item.brand} • ₹{item.price}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  searchQuery.trim().length > 1 && (
                    <div className="text-center py-4 text-xs text-slate-500">
                      No results matches your criteria
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Desktop Right items */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/products" className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-2">
              Browse
            </Link>

            {/* Wishlist Link */}
            <Link to="/wishlist" className="p-2.5 text-slate-300 hover:text-white relative hover:bg-slate-800/40 rounded-xl transition-colors">
              <Heart className="w-5 h-5" />
            </Link>

            {/* Cart Link */}
            <Link to="/cart" className="p-2.5 text-slate-300 hover:text-white relative hover:bg-slate-800/40 rounded-xl transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute top-1 right-1 bg-blue-600 text-white font-bold text-[10px] w-4.5 h-4.5 flex items-center justify-center rounded-full border border-dark-950">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* User Controls */}
            {userInfo ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-1.5 p-1.5 hover:bg-slate-800/40 rounded-xl text-slate-300 hover:text-white transition-colors"
                >
                  {userInfo.profileImage ? (
                    <img src={userInfo.profileImage} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-700" />
                  ) : (
                    <div className="bg-gradient-to-tr from-blue-500 to-indigo-500 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {userInfo.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-semibold max-w-[80px] truncate">{userInfo.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${profileDropdownOpen ? 'rotate-185' : ''}`} />
                </button>

                {/* Dropdown Options */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-12 w-52 glass rounded-2xl border border-slate-800 p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 border-b border-slate-800/50 mb-1">
                      <p className="text-xs font-bold text-slate-200 truncate">{userInfo.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{userInfo.email}</p>
                    </div>

                    {/* Role dashboard buttons */}
                    {userInfo.role === 'admin' && (
                      <Link
                        to="/admin-dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 text-xs text-slate-300 hover:text-blue-400 p-2 hover:bg-slate-800/50 rounded-xl transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    {userInfo.role === 'seller' && (
                      <Link
                        to="/seller-dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 text-xs text-slate-300 hover:text-blue-400 p-2 hover:bg-slate-800/50 rounded-xl transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Seller Dashboard
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 text-xs text-slate-300 hover:text-blue-400 p-2 hover:bg-slate-800/50 rounded-xl transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Account Settings
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 text-xs text-slate-300 hover:text-blue-400 p-2 hover:bg-slate-800/50 rounded-xl transition-colors"
                    >
                      <History className="w-4 h-4" />
                      My Orders
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 text-xs text-red-400 hover:bg-red-500/10 p-2 rounded-xl transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="text-xs font-semibold text-slate-300 hover:text-white px-4 py-2 hover:bg-slate-800/40 rounded-xl transition-colors">
                  Login
                </Link>
                <Link to="/register" className="glow-btn text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl border border-blue-500/20">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Burger menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white transition-colors focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-b border-slate-800/80 px-4 pt-2 pb-6 space-y-4 animate-in slide-in-from-top duration-300">
          
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-slate-900/60 border border-slate-800 focus:border-blue-500 text-slate-100 rounded-2xl pl-10 pr-4 py-2 text-sm focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3.5 top-2.5 text-slate-500 w-4 h-4" />
          </form>

          <div className="flex flex-col space-y-2">
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-white py-2 border-b border-slate-800/30"
            >
              Browse Products
            </Link>
            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white py-2 border-b border-slate-800/30"
            >
              <Heart className="w-4 h-4" /> Wishlist
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-sm font-medium text-slate-300 hover:text-white py-2 border-b border-slate-800/30"
            >
              <span className="flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Shopping Cart</span>
              {totalCartCount > 0 && (
                <span className="bg-blue-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-full">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {userInfo ? (
              <>
                <div className="pt-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Account ({userInfo.role})</div>
                
                {userInfo.role === 'admin' && (
                  <Link
                    to="/admin-dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-blue-400 py-1.5"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                  </Link>
                )}
                {userInfo.role === 'seller' && (
                  <Link
                    to="/seller-dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-blue-400 py-1.5"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Seller Dashboard
                  </Link>
                )}

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-blue-400 py-1.5"
                >
                  <Settings className="w-4 h-4" /> Settings
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-blue-400 py-1.5"
                >
                  <History className="w-4 h-4" /> My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-medium text-red-400 py-2 mt-2 text-left"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <div className="pt-4 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center text-sm font-semibold text-slate-300 py-2 border border-slate-800 hover:bg-slate-800/40 rounded-xl transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center text-sm font-semibold bg-blue-600 text-white py-2 rounded-xl transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      )}
    </nav>
  );
};

export default Navbar;
