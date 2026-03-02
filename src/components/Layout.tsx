import { Outlet, Link } from 'react-router-dom';
import { Droplets, Moon, Sun, Instagram, Send, Mail, ShoppingBag } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useState, useEffect } from 'react';
import { HomeConfig } from '../types';
import { useLanguage } from './LanguageProvider';
import { useCart } from './CartProvider';
import CartDrawer from './CartDrawer';

export default function Layout() {
  const { theme, toggleTheme } = useTheme();
  const [config, setConfig] = useState<HomeConfig | null>(null);
  const { language, setLanguage, t } = useLanguage();
  const { items, setIsCartOpen } = useCart();

  useEffect(() => {
    fetch('/api/settings/home')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans selection:bg-stone-200 dark:selection:bg-stone-800 transition-colors duration-300">
      {config?.announcement?.active && (
        <div className="bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 text-center py-2 px-4 text-xs font-medium uppercase tracking-widest">
          {config.announcement.text}
        </div>
      )}
      <header className="sticky top-0 z-50 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <Droplets className="w-6 h-6 text-stone-800 dark:text-stone-200 group-hover:text-stone-600 dark:group-hover:text-stone-400 transition-colors" />
              <span className="font-serif text-xl font-medium tracking-tight">Scentique</span>
            </Link>
            
            <div className="flex items-center gap-8">
              <nav className="hidden md:flex items-center gap-8">
                <Link to="/catalog" className="text-sm font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">{t('catalog')}</Link>
                <Link to="/about" className="text-sm font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">{t('about')}</Link>
                <Link to="/reviews" className="text-sm font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">{t('reviews')}</Link>
                <Link to="/contacts" className="text-sm font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">{t('contacts')}</Link>
              </nav>
              
              <div className="flex items-center gap-4 md:gap-6">
                <div className="hidden md:flex items-center gap-4 mr-2 border-r border-stone-200 dark:border-stone-800 pr-6">
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href="https://t.me/username" target="_blank" rel="noreferrer" className="text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                    <Send className="w-4 h-4" />
                  </a>
                  <a href="mailto:hello@scentique.com" className="text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                    <Mail className="w-4 h-4" />
                  </a>
                </div>

                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-lg transition-colors"
                  title={t('cart')}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {items.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[10px] font-bold flex items-center justify-center rounded-full transform translate-x-1 -translate-y-1">
                      {items.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </button>

                <button 
                  onClick={toggleTheme}
                  className="p-2 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-lg transition-colors"
                  title="Toggle Theme"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setLanguage(language === 'ru' ? 'be' : 'ru')}
                  className="text-[10px] font-medium text-stone-300 dark:text-stone-700 hover:text-stone-500 transition-colors uppercase tracking-widest"
                  title="Змяніць мову"
                >
                  {language}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <CartDrawer />

      <main className="min-h-[80vh]">
        <Outlet />
      </main>

      <footer className="border-t border-stone-200 dark:border-stone-800 mt-24 py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-stone-500 dark:text-stone-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Scentique. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
