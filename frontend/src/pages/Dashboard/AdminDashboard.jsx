import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Users, Package, DollarSign, ShoppingBag, TrendingUp, 
  Settings, Trash2, Edit3, ShieldAlert, PieChart, Star 
} from 'lucide-react';
import api from '../../utils/api.js';

const AdminDashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);

  // Tab controller: 'stats' | 'users' | 'products'
  const [activeTab, setActiveTab] = useState('stats');
  
  // Dashboard statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    categoryStats: [],
    monthlySales: [],
    topSellingProducts: []
  });

  // Users list
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);

  // Fetch admin stats
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users/analytics/dashboard');
      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const { data } = await api.get('/users');
      setUsersList(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (window.confirm(`Are you sure you want to change user role to '${newRole}'?`)) {
      try {
        await api.put(`/users/${userId}`, { role: newRole });
        alert('User role updated successfully');
        loadUsers();
        loadStats(); // reload numbers
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to update role');
      }
    }
  };

  // SVG Chart Calculations
  const salesArray = stats.monthlySales || [];
  const maxSalesVal = salesArray.length > 0 ? Math.max(...salesArray.map(item => item.sales)) : 1;
  
  // Chart dimensions
  const chartWidth = 500;
  const chartHeight = 200;
  const padding = 30;

  const points = salesArray.map((item, idx) => {
    const x = padding + (idx * (chartWidth - padding * 2)) / Math.max(1, salesArray.length - 1);
    // invert Y since SVG 0,0 is top-left
    const y = chartHeight - padding - (item.sales / maxSalesVal) * (chartHeight - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      
      <div>
        <h1 className="text-2xl font-black text-white">System Admin Dashboard</h1>
        <p className="text-xs text-slate-400 mt-1">Monitor site operations, manage user profiles, and review sales analytics</p>
      </div>

      {/* Admin tabs */}
      <div className="flex border-b border-slate-900 gap-2 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'stats' ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          Analytics & Sales Charts
        </button>
        <button
          onClick={() => { setActiveTab('users'); loadUsers(); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'users' ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          User Accounts Management ({stats.totalUsers})
        </button>
      </div>

      {/* TAB CONTENT: Stats cards and SVG charts */}
      {activeTab === 'stats' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Dashboard Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass rounded-2xl p-5 border border-slate-900 flex items-center gap-4">
              <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Accounts</p>
                <h3 className="text-base sm:text-lg font-black text-white">{stats.totalUsers}</h3>
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border border-slate-900 flex items-center gap-4">
              <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
                <Package className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Products</p>
                <h3 className="text-base sm:text-lg font-black text-white">{stats.totalProducts}</h3>
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border border-slate-900 flex items-center gap-4">
              <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                <ShoppingBag className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Orders</p>
                <h3 className="text-base sm:text-lg font-black text-white">{stats.totalOrders}</h3>
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border border-slate-900 flex items-center gap-4">
              <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Gross Revenue</p>
                <h3 className="text-base sm:text-lg font-black text-emerald-400">₹{stats.revenue.toLocaleString('en-IN')}</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* SVG Line Sales Chart */}
            <div className="lg:col-span-2 glass rounded-2xl border border-slate-900 p-6 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-blue-400" /> Monthly Revenue Trend
              </h2>

              {salesArray.length > 0 ? (
                <div className="space-y-4">
                  {/* SVG Chart Drawing */}
                  <div className="relative aspect-[5/2] w-full bg-slate-900/40 rounded-xl border border-slate-900 p-2 overflow-hidden">
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
                      {/* Grid Lines */}
                      <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#1e293b" strokeDasharray="3" />
                      <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#1e293b" strokeDasharray="3" />
                      <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#1e293b" />

                      {/* Chart Line */}
                      {salesArray.length > 1 && (
                        <polyline
                          fill="none"
                          stroke="rgb(59, 130, 246)"
                          strokeWidth="3.5"
                          points={points}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {/* Nodes */}
                      {salesArray.map((item, idx) => {
                        const x = padding + (idx * (chartWidth - padding * 2)) / Math.max(1, salesArray.length - 1);
                        const y = chartHeight - padding - (item.sales / maxSalesVal) * (chartHeight - padding * 2);
                        return (
                          <g key={idx} className="group/node">
                            <circle
                              cx={x}
                              cy={y}
                              r="5"
                              fill="rgb(15, 23, 42)"
                              stroke="rgb(59, 130, 246)"
                              strokeWidth="2.5"
                            />
                            {/* Text values */}
                            <text
                              x={x}
                              y={y - 10}
                              fill="#94a3b8"
                              fontSize="8"
                              textAnchor="middle"
                              fontWeight="bold"
                            >
                              ₹{(item.sales / 1000).toFixed(0)}k
                            </text>
                            
                            {/* Bottom month label */}
                            <text
                              x={x}
                              y={chartHeight - 10}
                              fill="#475569"
                              fontSize="8"
                              textAnchor="middle"
                            >
                              {item.month}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  <p className="text-[10px] text-slate-500 text-center">Chart data aggregate represents all paid and COD customer checkout invoices</p>
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-slate-500">
                  No monthly sales coordinates to chart. Seed data to verify dashboards.
                </div>
              )}
            </div>

            {/* Category analysis panel */}
            <div className="glass rounded-2xl border border-slate-900 p-6 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <PieChart className="w-4.5 h-4.5 text-blue-400" /> Catalog Analysis
              </h2>

              <div className="space-y-4 pt-2">
                {stats.categoryStats && stats.categoryStats.length > 0 ? (
                  stats.categoryStats.map((cat) => {
                    const percentage = Math.round((cat.count / stats.totalProducts) * 100);
                    return (
                      <div key={cat._id} className="space-y-1.5 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-350">{cat._id}</span>
                          <span className="text-slate-400">{cat.count} items ({percentage}%)</span>
                        </div>
                        {/* Shimmer Bar */}
                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500">No categories found in store.</div>
                )}
              </div>
            </div>

          </div>

          {/* Top Selling Products lists */}
          {stats.topSellingProducts && stats.topSellingProducts.length > 0 && (
            <div className="glass rounded-2xl border border-slate-900 p-6 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Top-Selling Offerings</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
                {stats.topSellingProducts.map((prod, index) => (
                  <div key={index} className="glass border border-slate-850 p-4 rounded-xl flex flex-col justify-between text-center space-y-2">
                    <span className="text-lg">🏆</span>
                    <div>
                      <h4 className="font-semibold text-slate-200 line-clamp-1">{prod.name}</h4>
                      <p className="text-[10px] text-slate-450 mt-1">{prod.quantity} units sold</p>
                      <p className="font-bold text-blue-400 mt-0.5">₹{prod.sales.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT: User accounts list */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {usersLoading ? (
            <div className="text-center py-6 text-slate-400 text-xs animate-pulse">Loading accounts...</div>
          ) : usersList.length > 0 ? (
            <div className="glass rounded-2xl border border-slate-900 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 bg-slate-900/30 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Account Holder</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Contact Phone</th>
                    <th className="p-4">Current Role</th>
                    <th className="p-4 text-right">Switch Authorization</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((user) => (
                    <tr key={user._id} className="border-b border-slate-900/50 hover:bg-slate-900/30">
                      <td className="p-4 font-semibold text-slate-200">{user.name}</td>
                      <td className="p-4 text-slate-350">{user.email}</td>
                      <td className="p-4 text-slate-350">{user.phone || 'N/A'}</td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          user.role === 'admin' 
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                            : user.role === 'seller'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-slate-800 text-slate-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {/* Do not allow changing self role */}
                        {user._id !== userInfo?._id ? (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className="bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 text-xs rounded-lg outline-none"
                          >
                            <option value="customer">Customer</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold italic">Self Session</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs">No registered accounts found inside database.</div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
