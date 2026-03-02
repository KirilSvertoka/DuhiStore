import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HomeConfig, Product } from '../types';
import ProductCard from '../components/ProductCard';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../components/LanguageProvider';

export default function Home() {
  const [config, setConfig] = useState<HomeConfig | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    Promise.all([
      fetch('/api/settings/home').then(res => res.json()),
      fetch('/api/products').then(res => res.json())
    ])
      .then(([configData, productsData]) => {
        setConfig(configData);
        const featured = productsData.filter((p: Product) => 
          configData.featuredProductIds.includes(p.id)
        );
        setFeaturedProducts(featured);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load home data', err);
        setLoading(false);
      });
  }, []);

  if (loading || !config) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-pulse rounded-full bg-stone-200 dark:bg-stone-800 h-12 w-12"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full"
    >
      <Helmet>
        <title>Scentique | High-End Niche Perfumery</title>
        <meta name="description" content="Discover our curated collection of minimalist fragrances. Each bottle tells a story through carefully balanced top, heart, and base notes." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={config.hero.image} 
          alt="Hero" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 tracking-tight max-w-5xl"
          >
            {config.hero.title}
          </motion.h1>
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg md:text-xl text-stone-200 font-light max-w-2xl mb-10"
          >
            {config.hero.subtitle}
          </motion.p>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Link 
              to="/catalog" 
              className="inline-flex items-center gap-2 bg-white text-stone-900 px-8 py-4 rounded-full font-medium uppercase tracking-widest hover:bg-stone-100 transition-colors"
            >
              {t('shopCollection')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-stone-900 dark:text-stone-100">{config.featuredProductsTitle}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="h-[60vh] rounded-2xl overflow-hidden"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link 
              to="/catalog" 
              className="inline-flex items-center gap-2 text-stone-900 dark:text-stone-100 font-medium uppercase tracking-widest hover:text-stone-600 dark:hover:text-stone-400 transition-colors"
            >
              {t('viewAll')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Promo Images / Gallery */}
      {config.promoImages && config.promoImages.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.promoImages.map((img, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden"
              >
                <img 
                  src={img} 
                  alt={`Promo ${idx + 1}`} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
