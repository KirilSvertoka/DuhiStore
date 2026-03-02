import React from 'react';
import { Review } from '../../types';
import { CheckCircle, XCircle } from 'lucide-react';

interface ReviewsViewProps {
  reviews: Review[];
  token: string;
  onUpdate: () => void;
}

export default function ReviewsView({ reviews, token, onUpdate }: ReviewsViewProps) {
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

  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <div key={review.id} className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-medium text-stone-900 dark:text-stone-100">{review.userName}</h4>
              <p className="text-xs text-stone-500">on {(review as any).productName}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => updateStatus(review.id, 'Approved')}
                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
              <button 
                onClick={() => updateStatus(review.id, 'Rejected')}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < review.rating ? 'bg-amber-400' : 'bg-stone-200'}`} />
            ))}
          </div>
          <p className="text-sm text-stone-700 dark:text-stone-300 italic">"{review.comment}"</p>
          <div className="mt-4 flex justify-between items-center">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              review.status === 'Approved' ? 'bg-green-100 text-green-700' :
              review.status === 'Rejected' ? 'bg-red-100 text-red-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {review.status}
            </span>
            <span className="text-xs text-stone-400">{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
