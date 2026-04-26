import { motion } from 'framer-motion';
import { Mail, MapPin, Send, Code, Globe, MessageCircle } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="py-32 relative bg-gray-900 text-white overflow-hidden mt-32 rounded-t-[3rem]">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-48 bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-heading font-bold mb-6">
              Let's Build Something <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Amazing</span>
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-md">
              I'm always open to discussing product design work or partnership opportunities. Let's create something extraordinary together.
            </p>

            <div className="space-y-6 mb-12">
              <div className="flex items-center gap-4 text-gray-300">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Mail size={20} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email Me</div>
                  <a href="mailto:hello@example.com" className="font-medium hover:text-blue-400 transition-colors">hello@example.com</a>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-gray-300">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <MapPin size={20} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="font-medium">Kochi, Kerala</div>
                </div>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-4">
              {[Code, Globe, MessageCircle].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300 interactive"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl"
          >
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 ml-1">First Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all interactive"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 ml-1">Last Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all interactive"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Email</label>
                <input 
                  type="email" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all interactive"
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Message</label>
                <textarea 
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all interactive resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>

              <button 
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-2 transition-colors interactive group"
              >
                Send Message
                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </motion.div>

        </div>

        {/* Footer */}
        <div className="mt-32 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 pb-8">
          <div>© {new Date().getFullYear()} Ashik. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </section>
  );
}
