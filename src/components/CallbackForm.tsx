import React, { useState } from 'react';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';

export default function CallbackForm() {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to send');
      
      setStatus('success');
      setFormData({ name: '', phone: '', message: '' });
      
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-emerald-600 dark:text-emerald-400 space-y-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
        <CheckCircle2 className="w-12 h-12" />
        <div>
          <h3 className="font-serif text-xl mb-1 text-emerald-800 dark:text-emerald-300">Request Received</h3>
          <p className="text-emerald-600/80 dark:text-emerald-400/80 text-sm">Our manager will contact you shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1">
        <label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Name</label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 focus:border-transparent transition-all placeholder:text-stone-400 dark:placeholder:text-stone-500 text-stone-900 dark:text-stone-100"
          placeholder="Jane Doe"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="phone" className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Phone Number</label>
        <input
          type="tel"
          id="phone"
          required
          value={formData.phone}
          onChange={(e) => {
            const val = e.target.value;
            if (/^[0-9+\-\s()]*$/.test(val)) {
              setFormData({ ...formData, phone: val });
            }
          }}
          className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 focus:border-transparent transition-all placeholder:text-stone-400 dark:placeholder:text-stone-500 text-stone-900 dark:text-stone-100"
          placeholder="+1 (555) 000-0000"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="message" className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Message (Optional)</label>
        <textarea
          id="message"
          rows={3}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 focus:border-transparent transition-all resize-none placeholder:text-stone-400 dark:placeholder:text-stone-500 text-stone-900 dark:text-stone-100"
          placeholder="I'm looking for a woody fragrance..."
        />
      </div>

      {status === 'error' && (
        <p className="text-red-500 dark:text-red-400 text-sm text-center py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
          Failed to send request. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-medium tracking-wide hover:bg-stone-800 dark:hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 dark:focus:ring-offset-stone-900 dark:focus:ring-stone-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <span>Request Callback</span>
            <Send className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
