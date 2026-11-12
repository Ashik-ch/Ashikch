import { motion } from 'framer-motion';
import gtecLogo from '../assets/gteclogo.png';
import idtLogo from '../assets/idtlogo.webp';
import mythiliLogo from '../assets/mythililogo.jpg';

// Draft portfolio copy, not verbatim statements supplied by these clients.
const testimonials = [
  {
    name: "G-TEC Mahe",
    role: "Education & Training",
    logo: gtecLogo,
    text: "Presenting a diverse range of courses without overwhelming prospective students was central to our brief. Ashik gave G-TEC Mahe a clear structure and a confident visual identity, making course discovery and enquiries a natural part of the experience.",
    link: "https://gtecmahe.com/"
  },
  {
    name: "IDT",
    role: "Travel & Tourism",
    logo: idtLogo,
    text: "For IDT, the website needed to inspire travel while keeping the practical details within easy reach. The balance of destination imagery, organised package information, and intuitive navigation gives our offering a distinctive and professional presentation.",
    link: "https://goidt.in/"
  },
  {
    name: "Mythili Manthra",
    role: "Skin & Hair Clinic",
    logo: mythiliLogo,
    text: "A clinic's online presence should communicate care before the first appointment. Ashik approached Mythili Manthra with that understanding, pairing a refined design with accessible treatment information and a straightforward path to contacting our team.",
    link: "https://www.mythilimanthra.in/"
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
            Client Voices
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className="glass-card p-8 rounded-3xl relative group flex flex-col"
            >
              <blockquote className="text-gray-600 leading-relaxed mb-8">
                {testimonial.text}
              </blockquote>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white p-2">
                  <img
                    src={testimonial.logo}
                    alt={`${testimonial.name} logo`}
                    width="96"
                    height="64"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <a href={testimonial.link} target="_blank" rel="noreferrer" className="font-heading font-bold text-gray-900 hover:text-blue-600 transition-colors">
                    {testimonial.name}
                  </a>
                  <div className="text-sm font-medium text-blue-600">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
