import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { useLanguage } from './LanguageProvider';
import { motion } from 'motion/react';

interface RelatedProductsProps {
  currentProductId: number;
  scentFamilies: string[];
  brand: string;
}

export default function RelatedProducts({ currentProductId, scentFamilies, brand }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);
        return res.json();
      })
      .then((data: Product[]) => {
        const related = data
          .filter(p => p.id !== currentProductId)
          .filter(p => 
            p.brand === brand || 
            p.scentFamilies.some(sf => scentFamilies.includes(sf))
          )
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        
        setProducts(related);
      })
      .catch(console.error);
  }, [currentProductId, scentFamilies, brand]);

  if (products.length === 0) return null;

  return (
    <div className="mt-24 border-t border-brand-border pt-16">
      <h2 className="text-2xl font-serif text-brand-light mb-8">{t('youMayAlsoLike')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 bg-brand-border overflow-hidden rounded-2xl border border-brand-border">
        {products.map((product, index) => (
          <div key={product.id} className="bg-brand-bg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <ProductCard product={product} />
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
