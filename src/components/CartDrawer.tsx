import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from './CartProvider';
import { useLanguage } from './LanguageProvider';

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, total } = useCart();
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-stone-950 shadow-2xl z-50 flex flex-col border-l border-stone-200 dark:border-stone-800"
          >
            <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center">
              <h2 className="text-2xl font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" />
                {t('cart')}
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="text-center text-stone-500 dark:text-stone-400 mt-12">
                  {t('emptyCart')}
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.imageUrl} alt={item.name} className="w-20 h-24 object-cover rounded-lg" referrerPolicy="no-referrer" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-medium text-stone-900 dark:text-stone-100">{item.name}</h3>
                        <p className="text-sm text-stone-500 dark:text-stone-400">{item.brand}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-3 border border-stone-200 dark:border-stone-800 rounded-lg px-2 py-1">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"><Minus className="w-4 h-4" /></button>
                          <span className="text-sm font-medium text-stone-900 dark:text-stone-100 w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"><Plus className="w-4 h-4" /></button>
                        </div>
                        <span className="font-medium text-stone-900 dark:text-stone-100">{item.price.toFixed(2)} {t('currency')}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-stone-500 dark:text-stone-400">{t('total')}</span>
                  <span className="text-2xl font-serif text-stone-900 dark:text-stone-100">{total.toFixed(2)} {t('currency')}</span>
                </div>
                <button className="w-full py-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-medium uppercase tracking-widest hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors">
                  {t('checkout')}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
