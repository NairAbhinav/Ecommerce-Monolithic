import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-6 h-6 text-blue-500" />
              <span className="text-lg font-bold tracking-wider text-white">ELECTROPHONIC</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your premium destination for the latest smartphones and high-quality accessories. Shop the best deals from top global brands today.
            </p>
            <div className="flex space-x-3 text-slate-400">
              <a href="#" className="hover:text-blue-500 transition-colors"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="hover:text-blue-400 transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="hover:text-pink-500 transition-colors"><Instagram className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/products" className="hover:text-blue-400 transition-colors">Browse Catalog</Link></li>
              <li><Link to="/wishlist" className="hover:text-blue-400 transition-colors">My Wishlist</Link></li>
              <li><Link to="/cart" className="hover:text-blue-400 transition-colors">Shopping Cart</Link></li>
              <li><Link to="/orders" className="hover:text-blue-400 transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">Categories</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/products?category=Mobile Phones" className="hover:text-blue-400 transition-colors">Mobile Phones</Link></li>
              <li><Link to="/products?subcategory=Chargers" className="hover:text-blue-400 transition-colors">Chargers & Cables</Link></li>
              <li><Link to="/products?subcategory=Smart Watches" className="hover:text-blue-400 transition-colors">Smart Watches</Link></li>
              <li><Link to="/products?subcategory=Headphones" className="hover:text-blue-400 transition-colors">Headphones & Speakers</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">Store Details</h3>
            <ul className="space-y-3.5 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>456 tech hub, electronic avenue, bangalore, india</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span>support@electrophonic.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-900 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Electrophonic E-Commerce Platform. All Rights Reserved.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
