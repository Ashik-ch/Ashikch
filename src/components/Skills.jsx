import { motion } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';

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

const SkillSection = ({ title, skills, color }) => (
  <div className="mb-12">
    <h3 className="text-2xl font-heading font-bold text-gray-900 mb-6">{title}</h3>
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className="flex flex-wrap gap-4"
    >
      {skills.map((skill, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          whileHover={{ scale: 1.05, y: -2 }}
          className={`px-6 py-3 rounded-full border border-gray-100 shadow-sm font-medium ${color} bg-white transition-all cursor-default`}
        >
          {skill}
        </motion.div>
      ))}
    </motion.div>
  </div>
);

export default function Skills() {
  const { technical, tools, soft_skills } = portfolioData.skills;

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

        <div className="glass p-12 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
           <SkillSection title="Technical Skills" skills={technical} color="text-blue-600 hover:shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:border-blue-300" />
           <SkillSection title="Tools & Platforms" skills={tools} color="text-purple-600 hover:shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:border-purple-300" />
           <SkillSection title="Soft Skills" skills={soft_skills} color="text-teal-600 hover:shadow-[0_0_15px_rgba(13,148,136,0.3)] hover:border-teal-300" />
        </div>
      </div>
    </section>
  );
}
