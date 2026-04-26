import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Code, ExternalLink } from 'lucide-react';

const projects = [
  {
    id: 1,
    title: 'E-Commerce Platform',
    category: 'Full Stack',
    image: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tech: ['React', 'Node.js', 'MongoDB', 'Tailwind'],
    github: '#',
    live: '#'
  },
  {
    id: 2,
    title: 'Fintech Dashboard',
    category: 'Frontend',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tech: ['Angular', 'RxJS', 'SCSS'],
    github: '#',
    live: '#'
  },
  {
    id: 3,
    title: 'AI Image Generator',
    category: 'Full Stack',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tech: ['React', 'OpenAI', 'Express'],
    github: '#',
    live: '#'
  },
  {
    id: 4,
    title: 'Luxury Portfolio',
    category: 'Frontend',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tech: ['React', 'Framer Motion', 'Tailwind'],
    github: '#',
    live: '#'
  }
];

const categories = ['All', 'Frontend', 'Full Stack'];

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProjects = projects.filter(
    (project) => activeCategory === 'All' || project.category === activeCategory
  );

  return (
    <section id="projects" className="py-32 relative bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
            Selected Works
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full mb-10" />
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 interactive ${
                  activeCategory === category 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'glass text-gray-600 hover:text-blue-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="group relative rounded-3xl overflow-hidden glass-card aspect-[4/3] cursor-pointer"
              >
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {project.tech.map((tech, i) => (
                      <span key={i} className="px-3 py-1 text-xs font-medium text-white/90 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-white mb-4">
                    {project.title}
                  </h3>
                  
                  <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <a href={project.github} className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-full font-medium hover:bg-gray-100 transition-colors interactive">
                      <Code size={16} /> Code
                    </a>
                    <a href={project.live} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors interactive">
                      <ExternalLink size={16} /> Live Demo
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
