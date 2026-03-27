import React from 'react';
import { motion } from 'motion/react';

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-bg">
      <motion.svg
        width="600"
        height="150"
        viewBox="0 0 600 150"
        className="w-full max-w-2xl px-4"
      >
        <motion.text
          x="50%"
          y="50%"
          dy=".35em"
          textAnchor="middle"
          className="font-serif text-8xl tracking-tight stroke-brand-light fill-transparent"
          style={{
            strokeWidth: "1.5px",
            strokeLinecap: "round",
            strokeLinejoin: "round",
          }}
          initial={{
            strokeDasharray: 1000,
            strokeDashoffset: 1000,
          }}
          animate={{
            strokeDashoffset: 0,
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 0.5
          }}
        >
          Scentique
        </motion.text>
      </motion.svg>
    </div>
  );
}
