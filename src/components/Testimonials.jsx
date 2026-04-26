import { motion } from 'framer-motion';

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Product Manager at TechFlow",
    text: "Ashik transformed our entire user experience. His attention to detail and mastery of modern web animations made our platform feel premium and snappy. Highly recommended!",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
  },
  {
    name: "David Chen",
    role: "Founder of StartupX",
    text: "Working with Ashik was a game-changer. He delivered a stunning futuristic portfolio for us that wows every investor we show it to. Fast, reliable, and incredibly creative.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
  },
  {
    name: "Elena Rodriguez",
    role: "Design Lead at CreativeCo",
    text: "It's rare to find a developer who truly understands design. Ashik bridges that gap perfectly. The glassmorphism and motion effects he implemented were spot on with our vision.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
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
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className="glass-card p-8 rounded-3xl relative group"
            >
              <div className="text-blue-500 text-4xl font-serif absolute top-6 right-8 opacity-20 group-hover:opacity-40 transition-opacity">
                "
              </div>
              <p className="text-gray-600 leading-relaxed mb-8 relative z-10">
                "{testimonial.text}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <div className="font-heading font-bold text-gray-900">{testimonial.name}</div>
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
