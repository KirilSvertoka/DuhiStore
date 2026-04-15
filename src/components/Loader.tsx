import React from 'react';
import { motion } from 'motion/react';

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-bg">
      <motion.svg
        width="800"
        height="200"
        viewBox="0 0 800 200"
        className="w-full max-w-3xl px-4"
      >
        <motion.text
          x="50%"
          y="50%"
          dy=".35em"
          textAnchor="middle"
          className="font-serif text-[8rem] tracking-tight stroke-brand-light fill-brand-light"
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
          АРХЕТИП
        </motion.text>
      </motion.svg>
    </div>
  );
}
