import { motion } from "framer-motion"
import { portfolioData } from "../../data/portfolioData"
import HeroPattern from "../HeroPattern"

export default function Hero() {
  return (
    <section id="home" className="hero-background min-h-screen min-h-svh relative overflow-hidden flex items-end">
      <HeroPattern />
      <div className="relative z-20 w-full max-w-3xl px-6 md:px-8 pt-28 pb-32">
        <motion.div
          initial={false}
          className="mb-6 text-xs md:text-sm uppercase tracking-[0.2em] font-light text-cyan-300"
        >
          {portfolioData.personal_info.title.split('|').map(title => title.trim()).join(' · ')}
        </motion.div>
        <motion.h1
          className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-none tracking-tight"
          initial={false}
        >
          <span className="block font-light text-4xl md:text-5xl lg:text-6xl mb-2 bg-gradient-to-r from-white via-cyan-400 to-violet-400 bg-clip-text text-transparent">
            Hi, I'm
          </span>
          <span className="block font-black">{portfolioData.personal_info.name}</span>
        </motion.h1>
        <motion.p
          className="text-lg font-light text-white/70 mb-8 leading-relaxed max-w-xl"
          initial={false}
        >
          Build stunning modern websites, futuristic interfaces, and high
          performance digital products with clean code and creative design.
          Turning ideas into premium web experiences.
        </motion.p>
        <motion.div
          className="flex items-center gap-4 md:gap-6 flex-wrap"
          initial={false}
        >
          <motion.a
            href="#projects"
            className="px-8 md:px-10 py-4 rounded-full bg-transparent border-2 border-white/30 text-white font-medium text-sm hover:bg-white/10 hover:border-cyan-400/50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Projects
          </motion.a>
          <motion.a
            href="#contact"
            className="px-8 md:px-10 py-4 rounded-full bg-white/10 text-white font-semibold text-sm shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Hire Me
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
