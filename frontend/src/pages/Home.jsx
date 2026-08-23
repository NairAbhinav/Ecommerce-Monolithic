import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, ShieldAlert, Sparkles, Star, Tag, Truck } from 'lucide-react';
import api from '../utils/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { ProductGridSkeleton } from '../components/LoadingSkeleton.jsx';

const BRANDS = [
  { name: 'Apple', logo: '🍎' },
  { name: 'Samsung', logo: '📱' },
  { name: 'Google Pixel', logo: '🤖' },
  { name: 'OnePlus', logo: '1️⃣' },
  { name: 'Sony', logo: '🎧' },
  { name: 'Spigen', logo: '🛡️' }
];

const ACCESSORIES = [
  { name: 'Chargers', desc: '65W Fast Adaptors', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&auto=format&fit=crop&q=80' },
  { name: 'Smart Watches', desc: 'AMOLED Watches', image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=300&auto=format&fit=crop&q=80' },
  { name: 'Headphones', desc: 'Active Noise Canceling', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80' },
  { name: 'Mobile Covers', desc: 'Ultra Drop Protection', image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300&auto=format&fit=crop&q=80' }
];

const Home = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const res1 = await api.get('/products?limit=4&sort=latest');
        setNewArrivals(res1.data.products || []);

        const res2 = await api.get('/products?limit=4&sort=popular');
        setBestSellers(res2.data.products || []);
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-16">
      
      {/* Hero Banner Panel */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/40 border border-slate-800 p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 min-h-[420px] shadow-2xl">
        <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-[30%] h-[50%] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        {/* Hero Left Content */}
        <div className="flex-1 space-y-6 max-w-xl text-center md:text-left z-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" /> Latest Technology Launch
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Elevate Your Mobile <span className="gradient-text">Experience</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Unleash the future with state-of-the-art smartphones and elite chargers, noise-canceling headphones, and drop-tested accessories.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <Link to="/products" className="glow-btn flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-2xl border border-blue-500/20 text-sm shadow-lg shadow-blue-500/10">
              Browse Store <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/products?category=Accessories" className="text-sm font-semibold text-slate-300 hover:text-white px-5 py-3 hover:bg-slate-800/40 rounded-2xl border border-slate-800 transition-colors">
              Shop Accessories
            </Link>
          </div>
        </div>

        {/* Hero Right Banner Image */}
        <div className="flex-1 flex justify-center z-10 relative">
          <img
            src="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=80"
            alt="Latest Phone"
            className="w-72 h-auto rounded-3xl shadow-2xl border border-slate-700/30 object-cover rotate-3 group-hover:rotate-0 transition-transform duration-500 hover:shadow-[0_20px_50px_rgba(59,130,246,0.2)]"
          />
        </div>
      </section>

      {/* Feature Icons Row */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6 flex items-center gap-4 border border-slate-800">
          <div className="bg-blue-500/10 p-3.5 rounded-xl border border-blue-500/20">
            <Truck className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Free Secured Shipping</h3>
            <p className="text-xs text-slate-400">On all orders above ₹499</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 flex items-center gap-4 border border-slate-800">
          <div className="bg-indigo-500/10 p-3.5 rounded-xl border border-indigo-500/20">
            <Flame className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">1 Year Warranty</h3>
            <p className="text-xs text-slate-400">Assured brand replacement warranty</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 flex items-center gap-4 border border-slate-800">
          <div className="bg-purple-500/10 p-3.5 rounded-xl border border-purple-500/20">
            <Tag className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Best Pricing</h3>
            <p className="text-xs text-slate-400">Up to 20% discount on credit cards</p>
          </div>
        </div>
      </section>

      {/* Brand Visual Filters */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">Shop by Brand</h2>
            <p className="text-xs sm:text-sm text-slate-400">Explore premium smartphones and covers by make</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
          {BRANDS.map((b) => (
            <Link
              key={b.name}
              to={`/products?brand=${encodeURIComponent(b.name)}`}
              className="glass rounded-2xl p-5 border border-slate-800 hover:border-blue-500/30 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.03] group text-center"
            >
              <span className="text-3xl filter drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)] group-hover:scale-110 transition-transform">{b.logo}</span>
              <span className="text-xs font-semibold text-slate-200 group-hover:text-white">{b.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Accessories Grid Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Premium Accessories</h2>
          <p className="text-xs sm:text-sm text-slate-400">Maximize your smartphone utility with absolute gear</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ACCESSORIES.map((item) => (
            <Link
              key={item.name}
              to={`/products?subcategory=${encodeURIComponent(item.name)}`}
              className="relative overflow-hidden rounded-2xl border border-slate-800 group aspect-[4/3]"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10"></div>
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute bottom-4 left-4 z-25">
                <h3 className="font-extrabold text-white text-sm sm:text-base">{item.name}</h3>
                <p className="text-[10px] sm:text-xs text-slate-300">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">Best Selling Products</h2>
            <p className="text-xs sm:text-sm text-slate-400">Our customer favorites this week</p>
          </div>
          <Link to="/products?sort=popular" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bestSellers.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        )}
      </section>

      {/* Discount Banner Panel */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/20 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 justify-center md:justify-start">
            <Tag className="w-5 h-5 text-red-400 animate-bounce" /> Summer Upgrade Offer!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Get instant ₹1,500 cashback on orders above ₹15,000 using standard HDFC cards.
          </p>
        </div>
        <Link to="/products" className="glow-btn bg-white hover:bg-slate-100 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs whitespace-nowrap transition-colors border border-white/10 shadow-lg">
          Claim Cashback
        </Link>
      </section>

      {/* New Arrivals */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">New Arrivals</h2>
            <p className="text-xs sm:text-sm text-slate-400">Catch the latest products recently added</p>
          </div>
          <Link to="/products?sort=latest" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default Home;
