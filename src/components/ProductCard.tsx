import { Product } from '../types';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { useLanguage } from './LanguageProvider';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const ref = useRef(null);
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Subtle parallax move: -10% to 10% of container height
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <Link to={`/product/${product.id}`} ref={ref} className="block w-full h-full group overflow-hidden bg-stone-100 dark:bg-stone-950">
      <div className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 group-hover:bg-black/60 transition-colors duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]" />

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 flex flex-col justify-end text-white z-10 pointer-events-none">
          <div className="transform transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] translate-y-12 group-hover:translate-y-0">
            <p className="text-xs md:text-sm font-medium uppercase tracking-widest text-stone-300 mb-2 drop-shadow-sm">{product.brand}</p>
            <div className="flex justify-between items-end mb-4 gap-4">
              <h3 className="font-serif text-3xl md:text-4xl leading-tight drop-shadow-md">{product.name}</h3>
              <span className="text-xl md:text-2xl font-light whitespace-nowrap drop-shadow-md">{product.price.toFixed(2)} {t('currency')}</span>
            </div>
            
            {/* Description (hidden by default, appears on hover) */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]">
              <p className="text-stone-200 text-sm md:text-base leading-relaxed line-clamp-3 max-w-md">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
