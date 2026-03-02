import React from 'react';
import { User } from '../../types';

interface CustomersViewProps {
  users: User[];
  loading: boolean;
}

export default function CustomersView({ users, loading }: CustomersViewProps) {
  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div></div>;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-stone-50 dark:bg-stone-950 border-b border-stone-100 dark:border-stone-800">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">Customer</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">Orders</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">LTV</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">Avg Order</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500 text-right">Last Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-stone-900 dark:text-stone-100">{user.name}</div>
                  <div className="text-xs text-stone-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 text-sm">{user.orderCount || 0}</td>
                <td className="px-6 py-4 text-sm font-medium">{user.ltv || 0} BYN</td>
                <td className="px-6 py-4 text-sm">{user.avgOrderValue?.toFixed(2) || 0} BYN</td>
                <td className="px-6 py-4 text-right text-xs text-stone-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
