import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Wind, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.21, 1, 0.36, 1] }}
        className="text-center max-w-lg"
      >
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.21, 1, 0.36, 1] }}
          className="w-24 h-24 bg-stone-100 dark:bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <Wind className="w-10 h-10 text-stone-400 dark:text-stone-500" />
        </motion.div>
        
        <h1 className="text-8xl font-serif text-stone-900 dark:text-stone-100 mb-4 tracking-tighter">404</h1>
        <h2 className="text-2xl font-serif text-stone-800 dark:text-stone-200 mb-4">Scent Not Found</h2>
        
        <p className="text-stone-500 dark:text-stone-400 mb-10 leading-relaxed">
          Like a fleeting top note, the page you're looking for has vanished into thin air. 
          Perhaps the formula was changed, or the fragrance was discontinued.
        </p>
        
        <Link 
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Boutique</span>
        </Link>
      </motion.div>
    </div>
  );
}
