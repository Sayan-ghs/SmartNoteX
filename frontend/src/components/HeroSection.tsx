import { motion } from 'framer-motion';
import { ArrowRight, Github, Linkedin, Mail, Twitter } from 'lucide-react';

interface HeroSectionProps {
  onCTAClick: () => void;
}

export function HeroSection({ onCTAClick }: HeroSectionProps) {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500/10 to-green-500/10 border-2 border-black rounded-lg"
          >
            <span className="tracking-wide">👋 Welcome to my portfolio</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl lg:text-7xl tracking-tight"
            style={{ fontWeight: 800, lineHeight: 1.1 }}
          >
            Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Sayan</span> —
            <br />
            I build future-ready tech & products
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 max-w-xl"
          >
            Blockchain · AI · Systems · Research · Full-stack
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            {/* Primary CTA - Neo-brutalist */}
            <button
              onClick={onCTAClick}
              className="group px-8 py-4 bg-black text-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 flex items-center gap-2"
              style={{ fontWeight: 700 }}
            >
              View My Work
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary CTA */}
            <a
              href="#contact"
              className="px-8 py-4 bg-white text-black border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(59,130,246,0.5)] hover:shadow-[4px_4px_0px_0px_rgba(59,130,246,0.5)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200"
              style={{ fontWeight: 700 }}
            >
              Contact Me
            </a>
          </motion.div>
        </motion.div>

        {/* Right Content - Avatar Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative"
        >
          <div className="relative bg-gradient-to-br from-purple-50 to-blue-50 border-4 border-black rounded-2xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 h-[500px]">
            {/* Placeholder for 3D Avatar */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-8xl">👨‍💻</div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600" style={{ fontWeight: 600 }}>
                    Curious · Builder · Research-driven
                  </p>
                </div>
              </div>
            </div>

            {/* Accent decorations */}
            <div className="absolute -top-3 -right-3 w-24 h-24 bg-yellow-400 rounded-full border-4 border-black -z-10" />
            <div className="absolute -bottom-3 -left-3 w-16 h-16 bg-green-400 rounded-full border-4 border-black -z-10" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
