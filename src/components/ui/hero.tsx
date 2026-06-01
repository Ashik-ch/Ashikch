import { MeshGradient, PulsingBorder } from "@paper-design/shaders-react"
import { motion } from "framer-motion"
import Typewriter from "typewriter-effect"

import { portfolioData } from "../../data/portfolioData"

const StaticSvgDefs = () => (
  <svg className="absolute inset-0 w-0 h-0">
    <defs>
      <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
        <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
        <feColorMatrix
          type="matrix"
          values="1 0 0 0 0.02
                  0 1 0 0 0.02
                  0 0 1 0 0.05
                  0 0 0 0.9 0"
          result="tint"
        />
      </filter>
      <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
        <feColorMatrix
          in="blur"
          mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
          result="gooey"
        />
        <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
      </filter>
      <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="50%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#0891b2" />
      </linearGradient>
      <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="30%" stopColor="#06b6d4" />
        <stop offset="70%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#ffffff" />
      </linearGradient>
      <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
);// Lift static configurations outside the rendering path to avoid referential updates and WebGL re-initialization
const MESH_GRADIENT_COLORS = ["#000000", "#ffffff", "#06b6d4", "#0891b2", "#f97316"];
const MESH_GRADIENT_STYLE = { backgroundColor: "#000000" };

const PULSING_BORDER_COLORS = ["#06b6d4", "#8b5cf6", "#ffffff", "#00FF88", "#FFD700"];
const PULSING_BORDER_STYLE = {
  width: "60px",
  height: "60px",
  borderRadius: "50%",
};

const TITLES = portfolioData.personal_info.title.split('|').map(t => t.trim());

export default function ShaderShowcase() {
  return (
    <div id="home" className="min-h-screen bg-black relative overflow-hidden">
      <StaticSvgDefs />

      {/* Unified, high-performance WebGL Mesh Gradient. Overlapping multiple gradients removed to prevent overdraw and excessive GPU load. */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={MESH_GRADIENT_COLORS}
        speed={0.25}
        style={MESH_GRADIENT_STYLE}
      />

      {/* Hero Content */}
      <main className="absolute bottom-8 left-8 z-20 max-w-2xl">
        <div className="text-left">
          {/* Typewriter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-6 flex gap-3 items-center text-sm md:text-base uppercase tracking-[0.3em] font-light text-cyan-300"
          >
            <Typewriter
              options={{
                strings: TITLES,
                autoStart: true,
                loop: true,
                delay: 50,
                deleteSpeed: 30,
              }}
            />
            <span className="w-10 h-[1px] bg-cyan-300/50" />
          </motion.div>

          <motion.h1
            className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-none tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.span
              className="block font-light text-4xl md:text-5xl lg:text-6xl mb-2"
              style={{
                background: "linear-gradient(135deg,#ffffff 0%,#06b6d4 30%,#8b5cf6 70%,#ffffff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "url(#text-glow)",
              }}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear", }}            >
              Hi, I'm
            </motion.span>

            <span className="block font-black">{portfolioData.personal_info.name}</span>
          </motion.h1>

          <motion.p
            className="text-lg font-light text-white/70 mb-8 leading-relaxed max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Build stunning modern websites, futuristic interfaces, and high
            performance digital products with clean code and creative design.
            Turning ideas into premium web experiences.
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="flex items-center gap-6 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <motion.a
              href="#projects"
              className="px-10 py-4 rounded-full bg-transparent border-2 border-white/30 text-white font-medium text-sm hover:bg-white/10 hover:border-cyan-400/50 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Projects
            </motion.a>

            <motion.a
              href="#contact"
              className="px-10 py-4 rounded-full bg-white/10 text-white font-semibold text-sm shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Hire Me
            </motion.a>
          </motion.div>
        </div>
      </main>

      {/* Bottom Right Badge */}
      <div className="absolute bottom-8 right-8 z-30">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <PulsingBorder
            colors={PULSING_BORDER_COLORS}
            colorBack="#00000000"
            speed={1.5}
            roundness={1}
            thickness={0.1}
            softness={0.2}
            intensity={5}
            spots={5}
            spotSize={0.1}
            pulse={0.1}
            smoke={0.5}
            smokeSize={4}
            scale={0.65}
            rotation={0}
            style={PULSING_BORDER_STYLE}
          />
        </div>
      </div>
    </div>
  );
}