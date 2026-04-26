import { motion } from 'framer-motion';

const skills = [
  { name: 'React & Vite', level: 95, icon: '⚛️', color: 'bg-blue-500' },
  { name: 'Tailwind CSS', level: 90, icon: '🎨', color: 'bg-teal-400' },
  { name: 'Angular', level: 85, icon: '🅰️', color: 'bg-red-500' },
  { name: 'Node.js & Express', level: 80, icon: '🟢', color: 'bg-green-500' },
  { name: 'Framer Motion', level: 88, icon: '✨', color: 'bg-purple-500' },
  { name: 'UI/UX Design', level: 75, icon: '🎯', color: 'bg-pink-500' },
];

export default function Skills() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="skills" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
            Technical Arsenal
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full" />
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {skills.map((skill, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02, rotateY: 5, rotateX: 5 }}
              className="glass p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group"
              style={{ perspective: 1000 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <span className="text-4xl">{skill.icon}</span>
                <span className="text-xl font-bold text-gray-800">{skill.level}%</span>
              </div>
              
              <h3 className="text-xl font-heading font-semibold text-gray-900 mb-4 relative z-10">{skill.name}</h3>
              
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden relative z-10">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.2 + (index * 0.1), ease: "easeOut" }}
                  className={`h-full ${skill.color} relative shadow-[0_0_10px_rgba(0,0,0,0.2)]`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
