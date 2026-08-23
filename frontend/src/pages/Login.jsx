import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { login, clearError } from '../store/slices/authSlice.js';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { userInfo, loading, error } = useSelector((state) => state.auth);

  // Determine redirection path
  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
    return () => {
      dispatch(clearError());
    };
  }, [userInfo, navigate, redirect, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      dispatch(login({ email, password }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh]">
      
      <div className="glass rounded-3xl border border-slate-800/80 p-8 max-w-md w-full space-y-6 shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-t-3xl"></div>
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white">Welcome Back</h2>
          <p className="text-xs text-slate-400">Sign in to your customer, seller or admin account</p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. customer@gmail.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <Mail className="absolute left-3.5 top-3.5 text-slate-500 w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <Lock className="absolute left-3.5 top-3.5 text-slate-500 w-4 h-4" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full glow-btn bg-blue-600 hover:bg-blue-500 text-white font-bold h-11 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="border-t border-slate-900 pt-4 text-center text-xs text-slate-400">
          <span>Don't have an account? </span>
          <Link to={`/register?redirect=${redirect}`} className="text-blue-400 hover:underline font-bold">
            Create Account
          </Link>
        </div>

      </div>

    </div>
  );
};

export default Login;
