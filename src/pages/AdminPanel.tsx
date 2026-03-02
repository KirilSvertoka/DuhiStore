import React, { useState, useEffect } from 'react';
import { Product, Order, User, Review, CMSPage, HomeConfig } from '../types';
import { LogOut, Lock, LayoutDashboard, ShoppingBag, Package, Users, MessageSquare, FileText, BarChart3, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../components/ThemeProvider';

// Modular View Components
import DashboardView from '../components/admin/DashboardView';
import OrdersView from '../components/admin/OrdersView';
import InventoryView from '../components/admin/InventoryView';
import CustomersView from '../components/admin/CustomersView';
import ReviewsView from '../components/admin/ReviewsView';
import CMSView from '../components/admin/CMSView';
import ReportsView from '../components/admin/ReportsView';

export default function AdminPanel() {
  const { theme } = useTheme();
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'orders' | 'customers' | 'reviews' | 'cms' | 'reports'>('dashboard');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cmsPages, setCmsPages] = useState<CMSPage[]>([]);
  const [homeConfig, setHomeConfig] = useState<HomeConfig | null>(null);

  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem('adminToken', data.token);
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
    setToken(null);
    localStorage.removeItem('adminToken');
  };

  const fetchProducts = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setDashboardData(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setOrders(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setUsers(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchReviews = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/reviews', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setReviews(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchCMSPages = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/cms', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setCmsPages(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (token) {
      switch (activeTab) {
        case 'dashboard': fetchDashboardData(); break;
        case 'inventory': fetchProducts(); break;
        case 'orders': fetchOrders(); break;
        case 'customers': fetchUsers(); break;
        case 'reviews': fetchReviews(); break;
        case 'cms': fetchCMSPages(); fetchHomeConfig(); break;
      }
    }
  }, [token, activeTab]);

  const fetchHomeConfig = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/settings/home');
      if (!res.ok) throw new Error('Failed to fetch home config');
      const data = await res.json();
      setHomeConfig(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto mt-24 bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 mx-4 sm:mx-auto"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-stone-600 dark:text-stone-400" />
          </div>
          <h1 className="text-2xl font-serif text-stone-900 dark:text-stone-100">Admin Access</h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-2">Please sign in to manage the store.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Username</label>
            <input 
              type="text" 
              required 
              value={loginData.username} 
              onChange={e => setLoginData({...loginData, username: e.target.value})}
              className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 focus:border-transparent outline-none text-stone-900 dark:text-stone-100" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Password</label>
            <input 
              type="password" 
              required 
              value={loginData.password} 
              onChange={e => setLoginData({...loginData, password: e.target.value})}
              className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 focus:border-transparent outline-none text-stone-900 dark:text-stone-100" 
            />
          </div>

          {loginError && (
            <p className="text-red-500 dark:text-red-400 text-sm text-center py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">{loginError}</p>
          )}

          <button 
            type="submit" 
            disabled={isLoggingIn}
            className="w-full py-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoggingIn ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-stone-900 dark:text-stone-100">Admin Dashboard</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1">Manage your store and view analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              switch (activeTab) {
                case 'dashboard': fetchDashboardData(); break;
                case 'inventory': fetchProducts(); break;
                case 'orders': fetchOrders(); break;
                case 'customers': fetchUsers(); break;
                case 'reviews': fetchReviews(); break;
                case 'cms': fetchCMSPages(); fetchHomeConfig(); break;
              }
            }}
            className="p-2 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button 
            onClick={handleLogout}
            className="p-2 text-stone-500 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-stone-200 dark:border-stone-800">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'orders', label: 'Orders', icon: ShoppingBag },
          { id: 'inventory', label: 'Inventory', icon: Package },
          { id: 'customers', label: 'Customers', icon: Users },
          { id: 'reviews', label: 'Reviews', icon: MessageSquare },
          { id: 'cms', label: 'CMS', icon: FileText },
          { id: 'reports', label: 'Reports', icon: BarChart3 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 px-4 text-sm font-medium transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100' : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'dashboard' && <DashboardView data={dashboardData} loading={loading} />}
          {activeTab === 'orders' && <OrdersView orders={orders} token={token!} onUpdate={fetchOrders} />}
          {activeTab === 'inventory' && (
            <InventoryView 
              products={products} 
              loading={loading} 
              token={token!} 
              onUpdate={fetchProducts} 
              onAuthError={handleLogout} 
            />
          )}
          {activeTab === 'customers' && <CustomersView users={users} loading={loading} />}
          {activeTab === 'reviews' && <ReviewsView reviews={reviews} token={token!} onUpdate={fetchReviews} />}
          {activeTab === 'cms' && <CMSView pages={cmsPages} homeConfig={homeConfig} onUpdateHome={fetchHomeConfig} onUpdatePage={fetchCMSPages} token={token!} />}
          {activeTab === 'reports' && <ReportsView token={token!} />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
