import React from 'react';
import { Package, ShoppingBag, Users, FileText, Download } from 'lucide-react';

interface ReportsViewProps {
  token: string;
}

export default function ReportsView({ token }: ReportsViewProps) {
  const exportData = async (type: string, format: string) => {
    window.open(`/api/admin/export/${type}?format=${format}&token=${token}`, '_blank');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { title: 'Products Report', type: 'products', icon: Package },
        { title: 'Orders Report', type: 'orders', icon: ShoppingBag },
        { title: 'Customers Report', type: 'users', icon: Users },
      ].map(report => (
        <div key={report.type} className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-stone-50 dark:bg-stone-800 rounded-2xl flex items-center justify-center">
              <report.icon className="w-6 h-6 text-stone-600 dark:text-stone-400" />
            </div>
            <h3 className="text-xl font-serif">{report.title}</h3>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => exportData(report.type, 'json')}
              className="flex-1 py-3 bg-stone-50 dark:bg-stone-800 rounded-xl text-sm font-medium hover:bg-stone-100 transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" /> JSON
            </button>
            <button 
              onClick={() => exportData(report.type, 'csv')}
              className="flex-1 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> CSV
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
