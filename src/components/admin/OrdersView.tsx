import React from 'react';
import { Order } from '../../types';

interface OrdersViewProps {
  orders: Order[];
  token: string;
  onUpdate: () => void;
}

export default function OrdersView({ orders, token, onUpdate }: OrdersViewProps) {
  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) onUpdate();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-stone-50 dark:bg-stone-950 border-b border-stone-100 dark:border-stone-800">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">Order ID</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">Customer</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">Total</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">Status</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm">#{order.id.toString().padStart(6, '0')}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-stone-900 dark:text-stone-100">{order.customerName}</div>
                  <div className="text-xs text-stone-500">{order.customerEmail}</div>
                </td>
                <td className="px-6 py-4 text-sm font-medium">{order.total} BYN</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <select 
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value as any)}
                    className="text-xs bg-stone-100 dark:bg-stone-800 border-none rounded-lg px-2 py-1 outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
