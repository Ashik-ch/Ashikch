import { motion, useScroll, useTransform } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { ArrowRight, Download } from 'lucide-react';
import { useRef } from 'react';

export default function Hero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  // Floating elements variants
  const floatingVariants = {
    animate: (custom) => ({
      y: [0, -20, 0],
      x: [0, custom.x, 0],
      rotate: [0, custom.rotate, 0],
      transition: {
        duration: custom.duration,
        repeat: Infinity,
        ease: "easeInOut"
      }
    })
  };

  return (
    <section 
      id="home" 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      <motion.div 
        style={{ y, opacity }}
        className="max-w-7xl mx-auto px-6 lg:px-12 w-full z-10"
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-blue-200 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-sm font-medium text-gray-700 tracking-wide uppercase">Available for new opportunities</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-heading font-extrabold tracking-tight text-gray-900 mb-6"
          >
            Hi, I'm <span className="text-gradient-accent">Ashik</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-xl md:text-3xl font-light text-gray-600 mb-10 h-12"
          >
            <TypeAnimation
              sequence={[
                'Software Developer',
                2000,
                'UI Engineer',
                2000,
                'Creative Builder',
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a 
              href="#projects" 
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gray-900 text-white font-medium overflow-hidden interactive transition-transform hover:scale-105"
            >
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black" />
              <span className="relative">View My Work</span>
              <ArrowRight size={18} className="relative group-hover:translate-x-1 transition-transform" />
            </a>
            
            <a 
              href="#contact" 
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full glass font-medium text-gray-800 interactive hover:bg-gray-50 transition-all hover:scale-105"
            >
              <span className="relative">Download Resume</span>
              <Download size={18} className="relative group-hover:-translate-y-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating 3D Elements (Simulated) */}
      <motion.div 
        custom={{ x: 15, rotate: 10, duration: 6 }}
        variants={floatingVariants}
        animate="animate"
        className="absolute top-[20%] left-[15%] w-24 h-24 rounded-2xl glass-card hidden lg:flex items-center justify-center rotate-12 shadow-xl"
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React" className="w-12 h-12" />
      </motion.div>

      <motion.div 
        custom={{ x: -20, rotate: -15, duration: 8 }}
        variants={floatingVariants}
        animate="animate"
        className="absolute bottom-[25%] right-[15%] w-32 h-32 rounded-3xl glass-card hidden lg:flex items-center justify-center -rotate-6 shadow-2xl"
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" alt="Tailwind" className="w-16 h-16" />
      </motion.div>
      
      <motion.div 
        custom={{ x: 10, rotate: 20, duration: 7 }}
        variants={floatingVariants}
        animate="animate"
        className="absolute top-[30%] right-[20%] w-16 h-16 rounded-full glass-card hidden lg:flex items-center justify-center shadow-lg"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
      </motion.div>
      
    </section>
  );
}
