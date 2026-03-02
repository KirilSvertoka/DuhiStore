import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product, Review } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, Send, CheckCircle2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import NoteDiagram from '../components/NoteDiagram';
import { useCart } from '../components/CartProvider';
import { useLanguage } from '../components/LanguageProvider';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ userName: '', rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/products/${id}/reviews`)
        .then(res => res.json())
        .then(setReviews)
        .catch(console.error);
    }
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: reviewForm.userName,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });
      if (res.ok) {
        setSubmitSuccess(true);
        setReviewForm({ userName: '', rating: 5, comment: '' });
        setTimeout(() => setSubmitSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Failed to submit review', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const found = data.find((p: Product) => p.id === Number(id));
        setProduct(found || null);
        if (found) {
          setActiveImage(found.imageUrl);
        }
        setLoading(false);
        
        if (found) {
          // Log view
          fetch(`/api/products/${found.id}/view`, { method: 'POST' }).catch(console.error);
        }
      })
      .catch(err => {
        console.error('Failed to fetch product', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-stone-200 dark:bg-stone-800 h-10 w-10"></div>
          <div className="flex-1 space-y-6 py-1">
            <div className="h-2 bg-stone-200 dark:bg-stone-800 rounded"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-stone-200 dark:bg-stone-800 rounded col-span-2"></div>
                <div className="h-2 bg-stone-200 dark:bg-stone-800 rounded col-span-1"></div>
              </div>
              <div className="h-2 bg-stone-200 dark:bg-stone-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24">
        <Helmet>
          <title>{t('notFound')} | Scentique</title>
        </Helmet>
        <h2 className="text-2xl font-serif text-stone-900 dark:text-stone-100 mb-4">{t('notFound')}</h2>
        <Link to="/catalog" className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToCatalog')}</span>
        </Link>
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.imageUrl,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "USD",
      "price": product.price,
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <Helmet>
        <title>{`${product.name} by ${product.brand} | Scentique`}</title>
        <meta name="description" content={product.description.substring(0, 150) + (product.description.length > 150 ? '...' : '')} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <Link to="/catalog" className="inline-flex items-center gap-2 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium uppercase tracking-wider">{t('backToCatalog')}</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
        <div className="space-y-4">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-stone-100 dark:bg-stone-800">
            <img 
              src={activeImage} 
              alt={product.name} 
              className="w-full h-full object-cover transition-all duration-500"
              referrerPolicy="no-referrer"
            />
          </div>
          {product.images && product.images.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              <button
                onClick={() => setActiveImage(product.imageUrl)}
                className={`flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 transition-all ${activeImage === product.imageUrl ? 'border-stone-900 dark:border-stone-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-stone-900 dark:border-stone-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt={`${product.name} ${idx + 2}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-3">{product.brand}</p>
            <h1 className="text-4xl md:text-5xl font-serif text-stone-900 dark:text-stone-100 mb-4 leading-tight">{product.name}</h1>
            <p className="font-mono text-2xl text-stone-800 dark:text-stone-200">{product.price.toFixed(2)} {t('currency')}</p>
          </div>

          <div className="prose prose-stone dark:prose-invert mb-12">
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-lg font-light">
              {product.description}
            </p>
          </div>

          <button 
            onClick={() => addToCart(product)}
            className="w-full md:w-auto px-12 py-4 mb-12 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full font-medium uppercase tracking-widest hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
          >
            {t('addToCart')}
          </button>

          <div className="space-y-6 border-t border-stone-200 dark:border-stone-800 pt-8">
            <h3 className="text-sm font-medium uppercase tracking-wider text-stone-900 dark:text-stone-100">{t('notes')}</h3>
            <div className="bg-stone-50 dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800">
              <NoteDiagram 
                topNotes={product.topNotes} 
                heartNotes={product.heartNotes} 
                baseNotes={product.baseNotes} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-stone-200 dark:border-stone-800 pt-16">
        <div className="lg:col-span-2 space-y-12">
          <h2 className="text-2xl font-serif text-stone-900 dark:text-stone-100">{t('reviews')}</h2>
          
          {reviews.length > 0 ? (
            <div className="space-y-8">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-stone-100 dark:border-stone-900 pb-8 last:border-0">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-medium text-stone-900 dark:text-stone-100">{review.userName}</p>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200 dark:text-stone-800'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-stone-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-400 font-light leading-relaxed italic">
                    "{review.comment}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-500 dark:text-stone-400 font-light italic">{t('noReviews')}</p>
          )}
        </div>

        <div className="bg-stone-50 dark:bg-stone-900/50 p-8 rounded-3xl border border-stone-100 dark:border-stone-800 h-fit">
          <h3 className="text-lg font-serif text-stone-900 dark:text-stone-100 mb-6">{t('leaveReview')}</h3>
          
          <AnimatePresence mode="wait">
            {submitSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center text-center py-8"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
                <p className="text-sm text-stone-600 dark:text-stone-400">{t('reviewSuccess')}</p>
              </motion.div>
            ) : (
              <motion.form 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleReviewSubmit} 
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 ml-1">
                    {t('name')}
                  </label>
                  <input 
                    required
                    type="text" 
                    value={reviewForm.userName}
                    onChange={e => setReviewForm({...reviewForm, userName: e.target.value})}
                    className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 focus:border-transparent outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 ml-1">
                    {t('rating')}
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({...reviewForm, rating: star})}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star 
                          className={`w-6 h-6 ${star <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300 dark:text-stone-700'}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 ml-1">
                    {t('comment')}
                  </label>
                  <textarea 
                    required
                    rows={4}
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                    className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 focus:border-transparent outline-none text-sm resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-medium uppercase tracking-widest text-xs hover:bg-stone-800 dark:hover:bg-stone-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{t('submit')}</span>
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
