import React from 'react';
import { motion } from 'motion/react';

export default function Loader() {
  const text = "АРХЕТИП";
  const letters = text.split("");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        repeat: Infinity,
        repeatType: "reverse" as const,
        repeatDelay: 1,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-bg">
      <motion.div
        className="flex overflow-hidden"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            variants={child}
            className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tighter text-brand-light inline-block"
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>
      
      {/* Subtle underline animation */}
      <motion.div 
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "150px", opacity: 1 }}
        transition={{ delay: 1, duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }}
        className="absolute bottom-[42%] h-[1px] bg-brand-accent/40"
      />
    </div>
  );
}
