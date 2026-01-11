import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, Twitter, Send } from 'lucide-react';

export function ContactSection() {
  return (
    <section id="contact" className="min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="max-w-5xl mx-auto w-full">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 
            className="text-5xl lg:text-6xl mb-6 inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 border-4 border-white rounded-xl shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
            style={{ fontWeight: 800 }}
          >
            Let's Build Together
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Whether it's a groundbreaking project, research collaboration, or just a chat about technology — I'd love to hear from you.
          </p>
        </motion.div>

        {/* Contact Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-10 shadow-2xl"
        >
          {/* Email CTA */}
          <div className="flex flex-col items-center space-y-6 mb-10">
            <a
              href="mailto:sayan@example.com"
              className="group flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-4 border-white rounded-2xl shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200"
              style={{ fontWeight: 700, fontSize: '1.25rem' }}
            >
              <Mail className="w-6 h-6" />
              Get in Touch
              <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <p className="text-gray-400 text-sm">sayan@example.com</p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/20" />
            <span className="text-gray-400 text-sm">or connect via</span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.a
              href="https://github.com/sayan"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -4 }}
              className="flex flex-col items-center gap-3 p-6 bg-white/5 border-2 border-white/20 rounded-xl hover:bg-white/10 hover:border-white/40 transition-all"
            >
              <Github className="w-8 h-8" />
              <span style={{ fontWeight: 600 }}>GitHub</span>
            </motion.a>

            <motion.a
              href="https://linkedin.com/in/sayan"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -4 }}
              className="flex flex-col items-center gap-3 p-6 bg-white/5 border-2 border-white/20 rounded-xl hover:bg-white/10 hover:border-white/40 transition-all"
            >
              <Linkedin className="w-8 h-8" />
              <span style={{ fontWeight: 600 }}>LinkedIn</span>
            </motion.a>

            <motion.a
              href="https://twitter.com/sayan"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -4 }}
              className="flex flex-col items-center gap-3 p-6 bg-white/5 border-2 border-white/20 rounded-xl hover:bg-white/10 hover:border-white/40 transition-all"
            >
              <Twitter className="w-8 h-8" />
              <span style={{ fontWeight: 600 }}>Twitter</span>
            </motion.a>

            <motion.a
              href="mailto:sayan@example.com"
              whileHover={{ scale: 1.05, y: -4 }}
              className="flex flex-col items-center gap-3 p-6 bg-white/5 border-2 border-white/20 rounded-xl hover:bg-white/10 hover:border-white/40 transition-all"
            >
              <Mail className="w-8 h-8" />
              <span style={{ fontWeight: 600 }}>Email</span>
            </motion.a>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12 text-gray-400"
        >
          <p>© 2026 Sayan. Built with curiosity and code.</p>
          <p className="text-sm mt-2">Designed with ❤️ using React, Three.js, and Motion</p>
        </motion.div>
      </div>
    </section>
  );
}
