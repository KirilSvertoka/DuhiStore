import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product, Review, getVariantType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, Send, CheckCircle2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import NoteDiagram from '../components/NoteDiagram';
import { useCart } from '../components/CartProvider';
import { useLanguage } from '../components/LanguageProvider';
import RelatedProducts from '../components/RelatedProducts';
import RecentlyViewed from '../components/RecentlyViewed';

export default function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  const [selectedVariantId, setSelectedVariantId] = useState<number | undefined>(undefined);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ userName: '', rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (product?.id) {
      fetch(`/api/products/${product.id}/reviews`)
        .then(res => {
          if (!res.ok) throw new Error(`Reviews fetch failed: ${res.status}`);
          return res.json();
        })
        .then(setReviews)
        .catch(console.error);
    }
  }, [product?.id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?.id) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
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
        // Refresh reviews
        fetch(`/api/products/${product.id}/reviews`)
          .then(res => {
            if (!res.ok) throw new Error(`Reviews fetch failed: ${res.status}`);
            return res.json();
          })
          .then(setReviews)
          .catch(console.error);
      } else {
        throw new Error(`Review submit failed: ${res.status}`);
      }
    } catch (err) {
      console.error('Failed to submit review', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setActiveImage(data.imageUrl);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariantId(data.variants[0].id);
        }
        setLoading(false);
        
        // Log view
        fetch(`/api/products/${data.id}/view`, { method: 'POST' }).catch(console.error);
      })
      .catch(err => {
        console.error('Failed to fetch product', err);
        setProduct(null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-white/20 h-10 w-10"></div>
          <div className="flex-1 space-y-6 py-1">
            <div className="h-2 bg-white/20 rounded"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-white/20 rounded col-span-2"></div>
                <div className="h-2 bg-white/20 rounded col-span-1"></div>
              </div>
              <div className="h-2 bg-white/20 rounded"></div>
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
        <h2 className="text-2xl font-serif text-brand-light mb-4">{t('notFound')}</h2>
        <Link to="/catalog" className="text-brand-muted hover:text-white flex items-center justify-center gap-2">
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
      "priceCurrency": "BYN",
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
        <title>{`${product.name} — ${product.brand} | Scentique`}</title>
        <meta name="description" content={product.description.substring(0, 160)} />
        <meta property="og:title" content={`${product.name} — ${product.brand}`} />
        <meta property="og:description" content={product.description.substring(0, 160)} />
        <meta property="og:image" content={product.imageUrl} />
        <meta property="og:type" content="product" />
        <meta property="product:brand" content={product.brand} />
        <meta property="product:price:amount" content={product.price.toString()} />
        <meta property="product:price:currency" content="BYN" />
        <link rel="canonical" href={`${window.location.origin}/catalog/${product.slug}`} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <Link to="/catalog" className="inline-flex items-center gap-2 text-brand-muted hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium uppercase tracking-wider">{t('backToCatalog')}</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
        <div className="space-y-4">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-brand-bg">
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
                className={`flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 transition-all ${activeImage === product.imageUrl ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt={`${product.name} ${idx + 2}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-widest text-brand-muted mb-3">{product.brand}</p>
            <h1 className="text-4xl md:text-5xl font-serif text-brand-light mb-4 leading-tight">{product.name}</h1>
            <p className="font-mono text-2xl text-brand-light">
              {(selectedVariantId 
                ? product.variants?.find(v => v.id === selectedVariantId)?.price 
                : product.price
              )?.toFixed(2)} {t('currency')}
            </p>
          </div>

          {product.variants && product.variants.length > 0 && (
            <div className="mb-8">
              <p className="text-xs font-medium uppercase tracking-wider text-brand-muted mb-4 ml-1">Выберите объем</p>
              <div className="flex flex-col gap-6">
                {Object.entries(
                  product.variants.reduce((acc, variant) => {
                    const type = getVariantType(variant.size, language);
                    if (!acc[type]) acc[type] = [];
                    acc[type].push(variant);
                    return acc;
                  }, {} as Record<string, typeof product.variants>)
                ).map(([type, variants]) => (
                  <div key={type} className="space-y-3">
                    <h3 className="text-sm font-medium text-brand-light/80 uppercase tracking-widest ml-1">{type}</h3>
                    <div className="flex flex-col gap-2">
                      {variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariantId(variant.id)}
                          className={`relative flex items-center justify-between p-4 rounded-xl border transition-all ${
                            selectedVariantId === variant.id
                              ? 'border-white bg-white/10 text-white'
                              : 'border-brand-border text-brand-muted hover:border-white/40 hover:text-white/80'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedVariantId === variant.id ? 'border-white' : 'border-brand-muted'}`}>
                              {selectedVariantId === variant.id && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                            </div>
                            <span className="text-base font-medium">{variant.size}</span>
                          </div>
                          <span className="text-lg font-medium">{variant.price.toFixed(2)} {t('currency')}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="prose prose-invert mb-12">
            <p className="text-brand-muted leading-relaxed text-lg font-light">
              {language === 'be' && product.description_be ? product.description_be : product.description}
            </p>
          </div>

          <button 
            onClick={() => addToCart(product, selectedVariantId)}
            className="w-full md:w-auto px-12 py-4 mb-12 bg-white text-brand-bg rounded-full font-medium uppercase tracking-widest hover:bg-white/90 transition-colors"
          >
            {t('addToCart')}
          </button>

          <div className="space-y-6 border-t border-brand-border pt-8">
            <h3 className="text-sm font-medium uppercase tracking-wider text-brand-light">{t('notes')}</h3>
            <div className="bg-white/5 p-6 rounded-2xl border border-brand-border">
              <NoteDiagram 
                topNotes={product.topNotes} 
                heartNotes={product.heartNotes} 
                baseNotes={product.baseNotes} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-brand-border pt-16">
        <div className="lg:col-span-2 space-y-12">
          <h2 className="text-2xl font-serif text-brand-light">{t('reviews')}</h2>
          
          {reviews.length > 0 ? (
            <div className="space-y-8">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-brand-border pb-8 last:border-0">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-medium text-brand-light">{review.userName}</p>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-brand-border'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-brand-muted">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-brand-muted font-light leading-relaxed italic">
                    "{review.comment}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-brand-muted font-light italic">{t('noReviews')}</p>
          )}
        </div>

        <div className="bg-white/5 p-8 rounded-3xl border border-brand-border h-fit">
          <h3 className="text-lg font-serif text-brand-light mb-6">{t('leaveReview')}</h3>
          
          <AnimatePresence mode="wait">
            {submitSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center text-center py-8"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
                <p className="text-sm text-brand-muted">{t('reviewSuccess')}</p>
              </motion.div>
            ) : (
              <motion.form 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleReviewSubmit} 
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-brand-muted mb-2 ml-1">
                    {t('name')}
                  </label>
                  <input 
                    required
                    type="text" 
                    minLength={2}
                    maxLength={50}
                    value={reviewForm.userName}
                    onChange={e => setReviewForm({...reviewForm, userName: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-brand-border rounded-xl focus:ring-2 focus:ring-white focus:border-transparent outline-none text-sm text-brand-light"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-brand-muted mb-2 ml-1">
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
                          className={`w-6 h-6 ${star <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-brand-border'}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-brand-muted mb-2 ml-1">
                    {t('comment')}
                  </label>
                  <textarea 
                    required
                    rows={4}
                    minLength={5}
                    maxLength={500}
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-brand-border rounded-xl focus:ring-2 focus:ring-white focus:border-transparent outline-none text-sm resize-none text-brand-light"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-white text-brand-bg rounded-xl font-medium uppercase tracking-widest text-xs hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

      {product && (
        <>
          <RelatedProducts 
            currentProductId={product.id} 
            scentFamilies={product.scentFamilies} 
            brand={product.brand} 
          />
          <RecentlyViewed currentProductId={product.id} />
        </>
      )}
    </motion.div>
  );
}
