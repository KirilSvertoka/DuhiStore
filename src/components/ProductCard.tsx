import React, { useRef, useState } from 'react';
import { Product, getVariantType } from '../types';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { useLanguage } from './LanguageProvider';
import { useCart } from './CartProvider';
import { useWishlist } from './WishlistProvider';
import { ShoppingBag, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const ref = useRef(null);
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedVariantId, setSelectedVariantId] = useState<number | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0].id : undefined
  );

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Subtle parallax move: -10% to 10% of container height
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const productUrl = `/catalog/${product.slug || product.id}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, selectedVariantId);
  };

  const handleVariantSelect = (e: React.MouseEvent, variantId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedVariantId(variantId);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const isWishlisted = isInWishlist(product.id);

  return (
    <div ref={ref} className="block w-full h-full group overflow-hidden bg-brand-bg relative">
      <div className="relative w-full aspect-[3/4] overflow-hidden">
        {/* Wishlist Button - Outside Link to be valid HTML */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-white'
            }`}
          />
        </button>

        <Link to={productUrl} className="block w-full h-full">
          {/* Image with parallax and scale down on hover */}
          <motion.img 
            style={{ y }}
            initial={{ scale: 1.2 }}
            whileHover={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
            src={product.imageUrl} 
            alt={product.name} 
            className="absolute inset-0 object-cover w-full h-full"
            referrerPolicy="no-referrer"
          />
          
          {/* Dark overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]" />

          {/* Content */}
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex flex-col justify-end text-white z-10 pointer-events-none">
            <div className="transform transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] translate-y-4 group-hover:translate-y-0">
              <p className="text-xs md:text-sm font-medium uppercase tracking-widest text-white/90 mb-1" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{product.brand}</p>
              <div className="flex justify-between items-end gap-4">
                <h3 className="font-serif text-2xl md:text-3xl leading-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{product.name}</h3>
                <span className="text-lg md:text-xl font-light whitespace-nowrap" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                  {product.variants && product.variants.length > 0 
                    ? `${language === 'be' ? 'ад' : 'от'} ${Math.min(...product.variants.map(v => v.price)).toFixed(2)}` 
                    : product.price.toFixed(2)} {t('currency')}
                </span>
              </div>
              
              {/* Description (hidden by default, appears on hover) */}
              <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]">
                <div className="overflow-hidden">
                  <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                    <p className="text-white/80 text-sm leading-relaxed line-clamp-2 mb-4">
                      {language === 'be' && product.description_be ? product.description_be : product.description}
                    </p>
                    
                    {/* Add to Cart Section */}
                    <div className="pointer-events-auto flex flex-col items-start gap-4 w-full">
                      {product.variants && product.variants.length > 0 && (
                        <div className="flex flex-col gap-3 w-full max-h-32 overflow-y-auto custom-scrollbar pr-2">
                          {Object.entries(
                            product.variants.reduce((acc, variant) => {
                              const type = getVariantType(variant.size, language);
                              if (!acc[type]) acc[type] = [];
                              acc[type].push(variant);
                              return acc;
                            }, {} as Record<string, typeof product.variants>)
                          ).map(([type, variants]) => (
                            <div key={type} className="space-y-1.5">
                              <span className="text-[10px] uppercase tracking-widest text-white/80 font-medium">{type}</span>
                              <div className="flex flex-wrap gap-2">
                                {variants.map((variant) => (
                                  <button
                                    key={variant.id}
                                    onClick={(e) => handleVariantSelect(e, variant.id)}
                                    className={`flex items-center justify-center px-3 py-1.5 rounded-lg border transition-colors ${
                                      selectedVariantId === variant.id
                                        ? 'bg-brand-accent text-white border-brand-accent'
                                        : 'bg-black/40 text-white border-white/30 hover:bg-white/20 hover:border-white/60'
                                    }`}
                                  >
                                    <span className="text-xs font-medium">{variant.size}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={handleAddToCart}
                        disabled={product.variants && product.variants.length > 0 && !selectedVariantId}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-accent text-white rounded-xl font-medium hover:bg-brand-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>{t('addToCart')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
