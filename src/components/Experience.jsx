import { motion } from 'framer-motion';

const experiences = [
  {
    company: "VAAS Intelligent Technology Solutions",
    location: "Kochi",
    role: "Internship",
    technologies: ["Angular 18", "PrimeFlex", "PrimeNG", "RXJS", "Bootstrap", "API Integration"],
    period: "2023 - Present"
  },
  {
    company: "AmruthaShala",
    location: "Hyderabad",
    role: "Angular Developer",
    technologies: ["Angular 15", "Angular Material", "SCSS", "Bootstrap", "Slack", "API Integration"],
    period: "2022 - 2023"
  },
  {
    company: "Luminar",
    location: "Kozhikode",
    role: "MEAN Stack Intern",
    technologies: ["Angular", "Node.js", "Express.js", "Bootstrap", "MongoDB"],
    period: "2021 - 2022"
  }
];

export default function Experience() {
  return (
    <section id="experience" className="py-32 relative">
      <div className="max-w-4xl mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
            Professional Journey
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full" />
        </motion.div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-blue-100 hidden md:block" />

          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`flex flex-col md:flex-row gap-8 ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 mt-8 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow shadow-blue-600/50 hidden md:block" />

                <div className="md:w-1/2" />
                
                <div className="md:w-1/2 relative group">
                  <div className={`glass-card p-8 rounded-3xl transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl ${
                    index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'
                  }`}>
                    <div className="text-blue-600 font-mono text-sm font-bold mb-2">{exp.period}</div>
                    <h3 className="text-2xl font-heading font-bold text-gray-900 mb-1">{exp.role}</h3>
                    <div className="text-gray-600 font-medium mb-4 flex justify-between items-center">
                      <span>{exp.company}</span>
                      <span className="text-sm opacity-70 bg-gray-100 px-2 py-1 rounded-md">{exp.location}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-6">
                      {exp.technologies.map((tech, i) => (
                        <span key={i} className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-100 rounded-full shadow-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
