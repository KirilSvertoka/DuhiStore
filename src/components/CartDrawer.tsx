import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag, CheckCircle2, ArrowLeft, RefreshCw, CreditCard } from 'lucide-react';
import { useCart } from './CartProvider';
import { useLanguage } from './LanguageProvider';
import { getVariantType } from '../types';

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, total, clearCart } = useCart();
  const { t, language } = useLanguage();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [customerData, setCustomerData] = useState({ name: '', phone: '' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get('checkout');
    const orderId = params.get('order_id');

    if (checkoutStatus === 'success') {
      setIsCartOpen(true);
      setIsSuccess(true);
      clearCart();
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (checkoutStatus === 'cancel') {
      setIsCartOpen(true);
      setIsCheckingOut(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [setIsCartOpen, clearCart]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerData.name,
          customer_phone: customerData.phone,
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            selectedVariantId: item.selectedVariantId,
            selectedVariantSize: item.selectedVariantSize,
            imageUrl: item.imageUrl
          })),
          total
        })
      });

      if (res.ok) {
        setIsSuccess(true);
        clearCart();
      } else {
        const data = await res.json();
        alert(data.error || t('failedToSend'));
      }
    } catch (err) {
      console.error(err);
      alert(t('failedToSend'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDrawer = () => {
    setIsCartOpen(false);
    // Reset states after animation
    setTimeout(() => {
      setIsCheckingOut(false);
      setIsSuccess(false);
      setCustomerData({ name: '', phone: '' });
    }, 300);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-brand-bg shadow-2xl z-50 flex flex-col border-l border-brand-border"
          >
            <div className="p-6 border-b border-brand-border flex justify-between items-center">
              <div className="flex items-center gap-3">
                {isCheckingOut && !isSuccess && (
                  <button 
                    onClick={() => setIsCheckingOut(false)}
                    className="p-2 -ml-2 text-brand-muted hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <h2 className="text-2xl font-serif text-brand-light flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6" />
                  {isSuccess ? t('orderSuccess') : t('cart')}
                </h2>
              </div>
              <button onClick={closeDrawer} className="p-2 text-brand-muted hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center space-y-4"
                >
                  <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-serif text-brand-light">{t('orderSuccess')}</h3>
                  <p className="text-brand-muted">{t('orderSuccessDesc')}</p>
                  <button 
                    onClick={closeDrawer}
                    className="mt-8 px-8 py-3 bg-brand-accent text-white rounded-xl font-medium hover:bg-brand-accent-hover transition-colors"
                  >
                    {t('backToCatalog')}
                  </button>
                </motion.div>
              ) : isCheckingOut ? (
                <form onSubmit={handleCheckout} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium uppercase tracking-wider text-brand-muted ml-1">{t('name')}</label>
                      <input 
                        required
                        type="text" 
                        minLength={2}
                        maxLength={100}
                        value={customerData.name}
                        onChange={e => setCustomerData({...customerData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-white/5 border border-brand-border rounded-xl focus:ring-2 focus:ring-white outline-none text-brand-light placeholder:text-brand-muted"
                        placeholder={t('placeholderName')}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium uppercase tracking-wider text-brand-muted ml-1">{t('phoneNumber')}</label>
                      <input 
                        required
                        type="tel" 
                        pattern="^(\+?[0-9\s\-\(\)]{7,20})$"
                        title="Введите корректный номер телефона"
                        value={customerData.phone}
                        onChange={e => setCustomerData({...customerData, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-white/5 border border-brand-border rounded-xl focus:ring-2 focus:ring-white outline-none text-brand-light placeholder:text-brand-muted"
                        placeholder={t('placeholderPhone')}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-brand-border space-y-4">
                    <div className="bg-white/5 border border-brand-border rounded-xl p-4 text-center">
                      <p className="text-sm text-brand-light mb-1">Оплата онлайн находится в разработке 🛠</p>
                      <p className="text-xs text-brand-muted">Оплата производится при получении заказа.</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-brand-border">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-brand-muted">{t('total')}</span>
                      <span className="text-2xl font-serif text-brand-light">{total.toFixed(2)} {t('currency')}</span>
                    </div>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-brand-accent text-white rounded-xl font-medium uppercase tracking-widest hover:bg-brand-accent-hover transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Оформить заказ'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {items.length === 0 ? (
                    <div className="text-center text-brand-muted mt-12">
                      {t('emptyCart')}
                    </div>
                  ) : (
                    items.map(item => {
                      const cartItemId = item.selectedVariantId ? `${item.id}-${item.selectedVariantId}` : `${item.id}`;
                      return (
                        <div key={cartItemId} className="flex gap-4">
                          <img src={item.imageUrl} alt={item.name} className="w-20 h-24 object-cover rounded-lg" referrerPolicy="no-referrer" />
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-medium text-brand-light">{item.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-brand-muted">{item.brand}</p>
                                {item.selectedVariantSize && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-white/10 text-brand-muted rounded uppercase tracking-wider font-medium">
                                    {getVariantType(item.selectedVariantSize, language)} {item.selectedVariantSize}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <div className="flex items-center gap-3 border border-brand-border rounded-lg px-2 py-1">
                                <button onClick={() => updateQuantity(cartItemId, item.quantity - 1)} className="text-brand-muted hover:text-white"><Minus className="w-4 h-4" /></button>
                                <span className="text-sm font-medium text-brand-light w-4 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(cartItemId, item.quantity + 1)} className="text-brand-muted hover:text-white"><Plus className="w-4 h-4" /></button>
                              </div>
                              <span className="font-medium text-brand-light">{item.price.toFixed(2)} {t('currency')}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {items.length > 0 && !isCheckingOut && !isSuccess && (
              <div className="p-6 border-t border-brand-border bg-brand-bg/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-brand-muted">{t('total')}</span>
                  <span className="text-2xl font-serif text-brand-light">{total.toFixed(2)} {t('currency')}</span>
                </div>
                <button 
                  onClick={() => setIsCheckingOut(true)}
                  className="w-full py-4 bg-brand-accent text-white rounded-xl font-medium uppercase tracking-widest hover:bg-brand-accent-hover transition-colors"
                >
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
