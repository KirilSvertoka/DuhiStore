import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, TrendingUp, BarChart3, AlertCircle, CheckCircle, MessageSquare } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardViewProps {
  data: any;
  loading: boolean;
}

export default function DashboardView({ data, loading }: DashboardViewProps) {
  if (loading || !data) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div></div>;

  const metrics = [
    { label: 'Sales Today', value: `${data.metrics.salesToday} BYN`, icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Carts', value: data.metrics.activeCarts, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Conversion', value: `${data.metrics.conversion}%`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Monthly Sales', value: `${data.metrics.salesMonth} BYN`, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm"
          >
            <div className={`w-10 h-10 ${m.bg} dark:bg-stone-800 rounded-xl flex items-center justify-center mb-4`}>
              <m.icon className={`w-5 h-5 ${m.color}`} />
            </div>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{m.label}</p>
            <h3 className="text-2xl font-serif text-stone-900 dark:text-stone-100 mt-1">{m.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm">
          <h3 className="text-lg font-serif text-stone-900 dark:text-stone-100 mb-6">System Alerts</h3>
          <div className="space-y-4">
            {data.alerts.lowStock.length > 0 ? (
              data.alerts.lowStock.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-900 dark:text-red-400">Low Stock: {item.name}</p>
                    <p className="text-xs text-red-700 dark:text-red-500">{item.size} - Only {item.stock} left (Threshold: {item.stockThreshold})</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-400">All inventory levels are healthy.</p>
              </div>
            )}
            {data.alerts.pendingReviews > 0 && (
              <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                <p className="text-sm font-medium text-amber-900 dark:text-amber-400">{data.alerts.pendingReviews} reviews awaiting moderation.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm">
          <h3 className="text-lg font-serif text-stone-900 dark:text-stone-100 mb-6">Sales Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[{name: 'Mon', sales: 400}, {name: 'Tue', sales: 300}, {name: 'Wed', sales: 600}, {name: 'Thu', sales: 800}, {name: 'Fri', sales: 500}, {name: 'Sat', sales: 900}, {name: 'Sun', sales: 1100}]}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1c1917" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1c1917" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#78716c'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#78716c'}} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#1c1917" fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
