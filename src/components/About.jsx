import { motion } from 'framer-motion';
import { useRef } from 'react';
import profile from '../assets/ashik.jpg';

const stats = [
  { label: 'Years Experience', value: '3+' },
  { label: 'Projects Completed', value: '20+' },
  { label: 'Happy Clients', value: '10+' },
  { label: 'Lines of Code', value: '1M+' },
];

export default function About() {
  return (
    <section id="about" className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
            Behind the Code
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden glass-card p-2 aspect-[4/5] group max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
              <img
                src={profile}
                alt="Ashik Portrait"
                className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            {/* Floating decoration */}
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl -z-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-3xl font-heading font-bold text-gray-900 mb-6">
              I build <span className="text-blue-600">digital experiences</span> that inspire.
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              As a passionate Software Developer and UI Engineer, I specialize in crafting premium, highly interactive web applications. With a keen eye for design and a strong foundation in modern web technologies, I bridge the gap between aesthetic brilliance and technical excellence.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-10">
              My journey involves working with diverse teams and tackling complex problems, always aiming to deliver solutions that are not just functional, but truly memorable.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="glass p-6 rounded-2xl border border-gray-100 shadow-sm"
                >
                  <div className="text-3xl font-heading font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
