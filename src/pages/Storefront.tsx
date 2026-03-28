import { useEffect, useState, useRef } from 'react';
import { Product } from '../types';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CallbackForm from '../components/CallbackForm';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MessageCircle, X, ChevronDown, Check, SlidersHorizontal, Filter } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../components/LanguageProvider';

export default function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [activeGenderTab, setActiveGenderTab] = useState<'All' | 'Male' | 'Female' | 'Unisex'>('All');
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [activeBrand, setActiveBrand] = useState<string>('All');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>('name-asc');
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const genderParam = params.get('gender');
    const sortParam = params.get('sort');

    if (categoryParam) setActiveCategory(categoryParam);
    if (genderParam) setActiveGenderTab(genderParam as any);
    if (sortParam) setSortBy(sortParam);
  }, [location.search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch brands on mount
  useEffect(() => {
    fetch('/api/brands')
      .then(res => {
        if (!res.ok) throw new Error(`Brands fetch failed: ${res.status}`);
        return res.json();
      })
      .then(data => setBrands(['All', ...data]))
      .catch(console.error);
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    
    if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
    if (activeBrand !== 'All') params.append('brand', activeBrand);
    if (activeGenderTab !== 'All') params.append('gender', activeGenderTab);
    if (activeCategory !== 'All') params.append('category', activeCategory);
    if (selectedFamilies.length > 0) {
      // Map family IDs (e.g. 'familyFloral') to DB values (e.g. 'Floral')
      const mappedFamilies = selectedFamilies.map(f => f.replace('family', ''));
      params.append('families', mappedFamilies.join(','));
    }
    params.append('sort', sortBy);

    fetch(`/api/products?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch products', err);
        setLoading(false);
      });
  }, [debouncedSearchQuery, activeBrand, activeGenderTab, selectedFamilies, sortBy, activeCategory]);

  const scentFamilies = [
    { id: 'familyFloral', label: t('familyFloral') },
    { id: 'familyOriental', label: t('familyOriental') },
    { id: 'familyWoody', label: t('familyWoody') },
    { id: 'familyFresh', label: t('familyFresh') },
    { id: 'familyCitrus', label: t('familyCitrus') },
    { id: 'familySpicy', label: t('familySpicy') },
    { id: 'familyLeather', label: t('familyLeather') },
    { id: 'familyGourmand', label: t('familyGourmand') },
    { id: 'familyChypre', label: t('familyChypre') },
    { id: 'familyFougere', label: t('familyFougere') },
  ];

  const toggleFamily = (familyId: string) => {
    setSelectedFamilies(prev => 
      prev.includes(familyId) 
        ? prev.filter(id => id !== familyId)
        : [...prev, familyId]
    );
  };

  const resetFilters = () => {
    setActiveGenderTab('All');
    setSelectedFamilies([]);
    setActiveBrand('All');
    setActiveCategory('All');
    setSortBy('name-asc');
    setSearchQuery('');
  };

  const activeFiltersCount = (activeGenderTab !== 'All' ? 1 : 0) + selectedFamilies.length + (activeBrand !== 'All' ? 1 : 0) + (sortBy !== 'name-asc' ? 1 : 0) + (activeCategory !== 'All' ? 1 : 0);

  const scrollToCallback = () => {
    const element = document.getElementById('callback-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="pb-24 relative"
    >
      <Helmet>
        <title>Каталог нишевой парфюмерии | Arhetip</title>
        <meta name="description" content="Широкий выбор селективных ароматов. Фильтруйте по брендам, семействам и полу. Найдите свой идеальный парфюм в нашем каталоге." />
        <meta property="og:title" content="Каталог Arhetip | Эксклюзивные ароматы" />
        <meta property="og:description" content="Исследуйте нашу коллекцию нишевой парфюмерии. Лучшие бренды и уникальные композиции." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${window.location.origin}/catalog`} />
      </Helmet>

      <section className="text-center max-w-3xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 mb-8">
        <h1 className="text-5xl md:text-6xl font-serif tracking-tight text-brand-light leading-tight">
          {t('ourCollection')}
        </h1>
        <p className="text-lg text-brand-muted font-light leading-relaxed">
          {t('exploreCatalog')}
        </p>
      </section>

      <div className="sticky top-16 z-40 bg-brand-bg/95 backdrop-blur-md border-b border-brand-border mb-8 sm:mb-12 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-brand-muted" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-4 py-2.5 bg-white/10 border border-brand-border rounded-xl text-white placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all shadow-sm text-sm"
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                isFilterOpen || activeFiltersCount > 0
                  ? 'bg-brand-accent text-white border-brand-accent'
                  : 'bg-white/5 text-brand-muted border-brand-border hover:border-white/40'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">{t('filters')}</span>
              {activeFiltersCount > 0 && (
                <span className="bg-brand-bg text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border border-white/20">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-6 pb-2 space-y-8">
                  {/* Category Filter */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-medium uppercase tracking-wider text-brand-muted">
                      {t('categories')}
                    </h3>
                    <div className="relative">
                      <select
                        value={activeCategory}
                        onChange={(e) => setActiveCategory(e.target.value)}
                        className="w-full appearance-none bg-white/5 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-brand-light focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-shadow"
                      >
                        <option value="All">{t('allFamilies')}</option>
                        <option value="perfume">{t('perfume')}</option>
                        <option value="eau_de_toilette">{t('eauDeToilette')}</option>
                        <option value="cologne">{t('cologne')}</option>
                        <option value="oil">{t('oil')}</option>
                        <option value="decant">{language === 'be' ? 'Адліванты' : 'Отливанты'}</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-brand-muted">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Brand Filter */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-medium uppercase tracking-wider text-brand-muted">
                      {t('brand')}
                    </h3>
                    <div className="relative">
                      <select
                        value={activeBrand}
                        onChange={(e) => setActiveBrand(e.target.value)}
                        className="w-full appearance-none bg-white/5 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-brand-light focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-shadow"
                      >
                        {brands.map(brand => (
                          <option key={brand} value={brand}>
                            {brand === 'All' ? t('allBrands') : brand}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-brand-muted">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Gender Filter */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-medium uppercase tracking-wider text-brand-muted">
                      {t('gender')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'All', label: t('genderAll') },
                        { id: 'Female', label: t('genderFemale') },
                        { id: 'Male', label: t('genderMale') },
                        { id: 'Unisex', label: t('genderUnisex') }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveGenderTab(tab.id as any)}
                          className={`px-4 py-2 rounded-lg text-sm transition-all ${
                            activeGenderTab === tab.id
                              ? 'bg-white/20 text-white font-medium'
                              : 'text-brand-muted hover:bg-white/10'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-medium uppercase tracking-wider text-brand-muted">
                      {t('sortBy')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'name-asc', label: t('sortNameAsc') },
                        { id: 'name-desc', label: t('sortNameDesc') },
                        { id: 'price-asc', label: t('sortPriceAsc') },
                        { id: 'price-desc', label: t('sortPriceDesc') }
                      ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => setSortBy(option.id)}
                          className={`px-4 py-2 rounded-lg text-sm transition-all ${
                            sortBy === option.id
                              ? 'bg-white/20 text-white font-medium'
                              : 'text-brand-muted hover:bg-white/10'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scent Families */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-medium uppercase tracking-wider text-brand-muted">
                        {t('scentFamilies')}
                      </h3>
                      {selectedFamilies.length > 0 && (
                        <button 
                          onClick={() => setSelectedFamilies([])}
                          className="text-xs text-brand-muted hover:text-white underline"
                        >
                          {t('reset')}
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {scentFamilies.map(family => (
                        <button
                          key={family.id}
                          onClick={() => toggleFamily(family.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all border ${
                            selectedFamilies.includes(family.id)
                              ? 'bg-brand-accent text-white border-brand-accent'
                              : 'bg-transparent text-brand-muted border-brand-border hover:border-white/40'
                          }`}
                        >
                          {family.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-brand-border flex justify-end gap-4">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 text-sm text-brand-muted hover:text-white transition-colors"
                    >
                      {t('reset')}
                    </button>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="px-6 py-2 bg-brand-accent text-white rounded-lg text-sm font-medium hover:bg-brand-accent-hover transition-opacity"
                    >
                      {t('apply')}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 bg-brand-border overflow-hidden mb-16 sm:mb-24">
        {products.map((product, index) => {
          return (
            <div key={product.id} className="bg-brand-bg">
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
        {products.length === 0 && (
          <div className="col-span-full text-center py-24 text-brand-muted bg-brand-bg">
            {t('noProductsFound')} "{searchQuery}".
          </div>
        )}
      </section>

      <section id="callback-section" className="max-w-xl mx-auto bg-brand-bg/50 p-8 md:p-12 rounded-3xl shadow-sm border border-brand-border mx-4 sm:mx-auto mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-serif mb-2 text-brand-light">{t('needAssistance')}</h2>
          <p className="text-brand-muted text-sm">
            {t('leaveDetails')}
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
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 p-4 bg-brand-accent text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        aria-label="Contact us"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>
    </motion.div>
  );
}
