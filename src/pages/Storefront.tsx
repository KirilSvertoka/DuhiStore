import { useEffect, useState } from 'react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import CallbackForm from '../components/CallbackForm';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MessageCircle, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../components/LanguageProvider';

export default function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenderTab, setActiveGenderTab] = useState<'All' | 'Male' | 'Female' | 'Unisex'>('All');
  const [activeFamily, setActiveFamily] = useState<string>('All');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showStickySearch, setShowStickySearch] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 300);
      if (scrollPosition <= 300) {
        setShowStickySearch(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch products', err);
        setLoading(false);
      });
  }, []);

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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = activeGenderTab === 'All' || 
                          (activeGenderTab === 'Male' && product.gender === 'Male') ||
                          (activeGenderTab === 'Female' && product.gender === 'Female') ||
                          (activeGenderTab === 'Unisex' && product.gender === 'Unisex');
    const matchesFamily = activeFamily === 'All' || (product.scentFamilies && product.scentFamilies.includes(activeFamily));
    return matchesSearch && matchesGender && matchesFamily;
  });

  const scentFamilies = [
    { id: 'All', label: t('allFamilies') },
    { id: 'Floral', label: t('familyFloral') },
    { id: 'Oriental', label: t('familyOriental') },
    { id: 'Woody', label: t('familyWoody') },
    { id: 'Fresh', label: t('familyFresh') },
    { id: 'Citrus', label: t('familyCitrus') },
    { id: 'Spicy', label: t('familySpicy') },
    { id: 'Leather', label: t('familyLeather') },
    { id: 'Gourmand', label: t('familyGourmand') },
  ];

  const scrollToCallback = () => {
    const element = document.getElementById('callback-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="pb-24 relative"
    >
      <Helmet>
        <title>Catalog | Scentique</title>
        <meta name="description" content="Explore our complete collection of minimalist fragrances. Filter by gender, search by brand, and find your perfect scent." />
      </Helmet>

      <section className="text-center max-w-3xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 mb-8">
        <h1 className="text-5xl md:text-6xl font-serif tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
          Our <span className="italic text-stone-500 dark:text-stone-400">Collection</span>
        </h1>
        <p className="text-lg text-stone-600 dark:text-stone-400 font-light leading-relaxed">
          Explore our complete catalog of minimalist fragrances.
        </p>

        <div className="relative max-w-md mx-auto mt-6 sm:mt-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-stone-400 dark:text-stone-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 focus:border-transparent transition-all shadow-sm"
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      <div className="sticky top-16 z-40 bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 mb-8 sm:mb-12 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-4">
              <div className={`flex items-center sm:justify-center gap-6 sm:gap-12 overflow-x-auto no-scrollbar flex-1 transition-all duration-300 ${showStickySearch ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-full'}`}>
                {[
                  { id: 'All', label: t('genderAll') },
                  { id: 'Female', label: t('genderFemale') },
                  { id: 'Male', label: t('genderMale') },
                  { id: 'Unisex', label: t('genderUnisex') }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveGenderTab(tab.id as any)}
                    className={`py-4 text-sm font-medium uppercase tracking-widest transition-colors relative whitespace-nowrap flex-shrink-0 ${
                      activeGenderTab === tab.id 
                        ? 'text-stone-900 dark:text-stone-100' 
                        : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300'
                    }`}
                  >
                    {tab.label}
                    {activeGenderTab === tab.id && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900 dark:bg-stone-100"
                      />
                    )}
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {isScrolled && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: showStickySearch ? '100%' : 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex justify-end py-2"
                  >
                    {showStickySearch ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative w-full sm:w-80 flex items-center"
                      >
                        <Search className="absolute left-3 w-4 h-4 text-stone-400" />
                        <input
                          autoFocus
                          type="text"
                          placeholder={t('search')}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-10 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 transition-all"
                        />
                        <button 
                          onClick={() => setShowStickySearch(false)} 
                          className="absolute right-3 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => setShowStickySearch(true)}
                        className="p-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors rounded-full hover:bg-stone-200 dark:bg-transparent dark:hover:bg-stone-800"
                        aria-label="Search"
                      >
                        <Search className="w-5 h-5" />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-4 border-t border-stone-100 dark:border-stone-900 pt-4">
              {scentFamilies.map(family => (
                <button
                  key={family.id}
                  onClick={() => setActiveFamily(family.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeFamily === family.id
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                      : 'bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
                  }`}
                >
                  {family.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 bg-stone-100 dark:bg-stone-900 overflow-hidden mb-16 sm:mb-24">
        {filteredProducts.map((product, index) => {
          return (
            <div key={product.id} className="bg-white dark:bg-stone-950">
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  duration: 1, 
                  ease: [0.21, 1, 0.36, 1],
                  delay: (index % 3) * 0.1 
                }}
                className="h-full"
              >
                <ProductCard product={product} />
              </motion.div>
            </div>
          );
        })}
        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-24 text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-950">
            No products found matching "{searchQuery}".
          </div>
        )}
      </section>

      <section id="callback-section" className="max-w-xl mx-auto bg-white dark:bg-stone-900 p-8 md:p-12 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 mx-4 sm:mx-auto mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-serif mb-2 text-stone-900 dark:text-stone-100">Need Assistance?</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm">
            Leave your details and our fragrance expert will contact you to help find your perfect scent.
          </p>
        </div>
        <CallbackForm />
      </section>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
        onClick={scrollToCallback}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 p-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        aria-label="Contact us"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>
    </motion.div>
  );
}
