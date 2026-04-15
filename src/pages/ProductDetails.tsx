import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product, getVariantType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, X, ChevronLeft, ChevronRight, ShoppingBag, Minus, Plus } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import NoteDiagram from '../components/NoteDiagram';
import { useCart } from '../components/CartProvider';
import { useLanguage } from '../components/LanguageProvider';
import RelatedProducts from '../components/RelatedProducts';
import RecentlyViewed from '../components/RecentlyViewed';

interface FlyingItem {
  id: number;
  x: number;
  y: number;
}

export default function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  const [selectedVariantId, setSelectedVariantId] = useState<number | undefined>(undefined);
  const [isFullscreenGalleryOpen, setIsFullscreenGalleryOpen] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [quantity, setQuantity] = useState(1);

  const allImages = product ? [product.imageUrl, ...(product.images || [])] : [];

  const handleAddToCart = () => {
    if (!product) return;
    
    // Start animation
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const newItem = {
        id: Date.now(),
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      setFlyingItems(prev => [...prev, newItem]);
    }

    // Add to cart with quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedVariantId);
    }
  };

  const openFullscreen = (index: number) => {
    setFullscreenImageIndex(index);
    setIsFullscreenGalleryOpen(true);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFullscreenImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFullscreenImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
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
          <title>{t('notFound')} | Arhetip</title>
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
      <AnimatePresence>
        {flyingItems.map(item => {
          const cartButton = document.getElementById('cart-button');
          const targetRect = cartButton?.getBoundingClientRect() || { left: window.innerWidth - 50, top: 50 };
          
          return (
            <motion.div
              key={item.id}
              initial={{ 
                x: item.x - 12, 
                y: item.y - 12, 
                scale: 1, 
                opacity: 1 
              }}
              animate={{ 
                x: targetRect.left + 10, 
                y: targetRect.top + 10, 
                scale: 0.2, 
                opacity: 0.5 
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.4, 0, 0.2, 1] 
              }}
              onAnimationComplete={() => {
                setFlyingItems(prev => prev.filter(i => i.id !== item.id));
              }}
              className="fixed top-0 left-0 z-[9999] pointer-events-none"
            >
              <div className="w-6 h-6 bg-brand-accent rounded-full flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-3 h-3 text-white" />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <Helmet>
        <title>{`${product.name} — ${product.brand} | Arhetip`}</title>
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
          <div 
            className="aspect-[4/5] rounded-3xl overflow-hidden bg-brand-bg cursor-pointer group"
            onClick={() => openFullscreen(allImages.indexOf(activeImage) !== -1 ? allImages.indexOf(activeImage) : 0)}
          >
            <img 
              src={activeImage} 
              alt={product.name} 
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
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
                  className={`flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-brand-accent' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt={`${product.name} ${idx + 2}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-widest text-brand-muted mb-2">{product.brand}</p>
            <h1 className="text-4xl md:text-5xl font-serif text-brand-light mb-2 leading-tight">{product.name}</h1>
            <div className="flex items-center gap-4 text-brand-muted text-sm mb-6">
              <span>{product.concentration || 'EDP'}</span>
              <span className="w-px h-4 bg-brand-border" />
              <span>{product.gender === 'Male' ? (language === 'be' ? 'Для яго' : 'Для него') : product.gender === 'Female' ? (language === 'be' ? 'Для яе' : 'Для нее') : (language === 'be' ? 'Унісекс' : 'Для него и для нее')}</span>
            </div>
          </div>

          {product.variants && product.variants.length > 0 && (
            <div className="mb-8">
              <p className="text-xs font-medium uppercase tracking-wider text-brand-muted mb-4 ml-1">
                {language === 'be' ? 'Аб\'ём' : 'Объем'}
              </p>
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
                    <h3 className="text-[10px] font-medium text-brand-muted uppercase tracking-[0.2em] ml-1">{type}</h3>
                    <div className="flex flex-wrap gap-2">
                        {(variants as typeof product.variants).map((variant) => (
                          <button
                            key={variant.id}
                            onClick={() => setSelectedVariantId(variant.id)}
                            disabled={variant.stock === 0}
                            className={`px-6 py-3 rounded-lg border text-sm font-medium transition-all duration-300 ${
                              selectedVariantId === variant.id
                                ? 'bg-brand-light text-brand-bg border-brand-light shadow-lg'
                                : 'border-brand-border text-brand-light hover:border-brand-accent/60'
                            } ${variant.stock === 0 ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
                          >
                            {variant.size}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8">
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-serif text-brand-light">
                {(selectedVariantId 
                  ? product.variants?.find(v => v.id === selectedVariantId)?.price 
                  : product.price
                )?.toFixed(2)} {t('currency')}
              </span>
              {selectedVariantId && product.variants?.find(v => v.id === selectedVariantId)?.stock === 0 && (
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
                  {language === 'be' ? 'Няма ў наяўнасці' : 'Нет в наличии'}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-medium uppercase tracking-widest text-brand-muted ml-1">
                  {language === 'be' ? 'Колькасць' : 'Количество'}
                </label>
                <div className="flex items-center w-32 bg-brand-hover border border-brand-border rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex-1 h-12 flex items-center justify-center text-brand-light hover:bg-brand-accent/10 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-10 text-center bg-transparent border-none focus:ring-0 text-brand-light font-medium"
                  />
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex-1 h-12 flex items-center justify-center text-brand-light hover:bg-brand-accent/10 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <motion.button 
                ref={buttonRef}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                disabled={selectedVariantId ? product.variants?.find(v => v.id === selectedVariantId)?.stock === 0 : false}
                className="w-full md:w-auto px-12 py-5 bg-brand-accent text-white rounded-xl font-medium uppercase tracking-widest hover:bg-brand-accent-hover transition-all shadow-xl shadow-brand-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{t('addToCart')}</span>
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-12">
            <div className="bg-brand-hover p-4 rounded-2xl border border-brand-border">
              <p className="text-[10px] uppercase tracking-widest text-brand-muted mb-1">
                {language === 'be' ? 'Стойкасць' : 'Стойкость'}
              </p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-serif text-brand-light">{product.longevity || 70}%</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full mb-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${product.longevity || 70}%` }}
                    className="h-full bg-brand-accent"
                  />
                </div>
              </div>
            </div>
            <div className="bg-brand-hover p-4 rounded-2xl border border-brand-border">
              <p className="text-[10px] uppercase tracking-widest text-brand-muted mb-1">
                {language === 'be' ? 'Шлейф' : 'Шлейф'}
              </p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-serif text-brand-light">{product.sillage || 60}%</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full mb-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${product.sillage || 60}%` }}
                    className="h-full bg-brand-accent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 prose prose-invert max-w-none">
        <p className="text-brand-muted leading-relaxed text-lg font-light">
          {language === 'be' && product.description_be ? product.description_be : product.description}
        </p>
      </div>

      <div className="mt-24">
        <h2 className="text-2xl font-serif text-brand-light mb-12 text-center">{t('notes')}</h2>
        <NoteDiagram 
          topNotes={product.topNotes} 
          heartNotes={product.heartNotes} 
          baseNotes={product.baseNotes} 
        />
      </div>

      {product && (
        <>
          <RelatedProducts 
            product={product}
          />
          <RecentlyViewed currentProductId={product.id} />
        </>
      )}

      <AnimatePresence>
        {isFullscreenGalleryOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setIsFullscreenGalleryOpen(false)}
          >
            <button 
              className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors z-50"
              onClick={() => setIsFullscreenGalleryOpen(false)}
            >
              <X className="w-8 h-8" />
            </button>
            
            {allImages.length > 1 && (
              <>
                <button 
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors z-50"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button 
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors z-50"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            <div className="w-full h-full p-4 md:p-12 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <motion.img 
                key={fullscreenImageIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                src={allImages[fullscreenImageIndex]} 
                alt={`${product.name} gallery image ${fullscreenImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
