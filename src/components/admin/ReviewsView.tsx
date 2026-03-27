import React from 'react';
import { Review } from '../../types';
import { CheckCircle, XCircle } from 'lucide-react';
import Pagination from './Pagination';

interface ReviewsViewProps {
  reviews: Review[];
  token: string;
  onUpdate: () => void;
  loading: boolean;
  pagination: { page: number; total: number; limit: number };
  onPageChange: (page: number) => void;
}

export default function ReviewsView({ reviews, token, onUpdate, loading, pagination, onPageChange }: ReviewsViewProps) {
  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) onUpdate();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-brand-border border-t-brand-light rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <div key={review.id} className="bg-white/5 p-6 rounded-3xl border border-brand-border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-medium text-brand-light">{review.userName}</h4>
              <p className="text-xs text-brand-muted">о товаре {(review as any).productName}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => updateStatus(review.id, 'Approved')}
                className="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded-lg"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
              <button 
                onClick={() => updateStatus(review.id, 'Rejected')}
                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < review.rating ? 'bg-amber-400' : 'bg-white/20'}`} />
            ))}
          </div>
          <p className="text-sm text-brand-light italic">"{review.comment}"</p>
          <div className="mt-4 flex justify-between items-center">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              review.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' :
              review.status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
              'bg-amber-500/20 text-amber-400'
            }`}>
              {review.status === 'Approved' ? 'Одобрен' : review.status === 'Rejected' ? 'Отклонен' : 'Ожидает'}
            </span>
            <span className="text-xs text-brand-muted">{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
      <Pagination 
        currentPage={pagination.page} 
        totalItems={pagination.total} 
        itemsPerPage={pagination.limit} 
        onPageChange={onPageChange} 
      />
    </div>
  );
}
