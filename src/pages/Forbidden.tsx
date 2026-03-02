import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, ArrowLeft } from 'lucide-react';

export default function Forbidden() {
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
          className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <Lock className="w-10 h-10 text-red-400 dark:text-red-500" />
        </motion.div>
        
        <h1 className="text-8xl font-serif text-stone-900 dark:text-stone-100 mb-4 tracking-tighter">403</h1>
        <h2 className="text-2xl font-serif text-stone-800 dark:text-stone-200 mb-4">Exclusive Vault</h2>
        
        <p className="text-stone-500 dark:text-stone-400 mb-10 leading-relaxed">
          Access to this rare essence is restricted. You don't have the right notes to enter this private collection.
          Please present your credentials at the entrance.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/admin"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors font-medium w-full sm:w-auto"
          >
            <span>Present Credentials</span>
          </Link>
          <Link 
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-full hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors font-medium w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Boutique</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
