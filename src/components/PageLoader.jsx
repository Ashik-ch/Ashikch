import { useMemo } from "react";
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function PageLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);

  const loadingTitles = [
    "LOADING PORTFOLIO...",
    "PREPARING EXPERIENCE...",
    "INITIALIZING...",
    "OPENING PORTFOLIO...",
    "GETTING THINGS READY...",
    "WELCOME TO ASHIK.CH",
    "PREPARING MY WORKSPACE...",
    "LOADING MY JOURNEY...",
    "BUILDING FIRST IMPRESSION..."
  ];
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return prev + Math.floor(Math.random() * 10) + 5;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [onComplete]);

  const randomTitle = useMemo(() => {
    return loadingTitles[Math.floor(Math.random() * loadingTitles.length)];
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="relative w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-blue-600 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'linear', duration: 0.1 }}
        />
      </div>
      <motion.div
        className="mt-6 text-2xl font-heading font-light tracking-widest text-gray-800"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {randomTitle}
      </motion.div>
      <div className="absolute bottom-10 right-10 text-sm font-mono text-gray-400">
        {Math.min(progress, 100)}%
      </div>
    </motion.div>
  );
}
