import { motion } from 'framer-motion';
import { GraduationCap, Code2, Brain, Database } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="about" className="min-h-screen flex items-center justify-center px-6 py-20 bg-gray-50">
      <div className="max-w-7xl w-full">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 
            className="text-5xl lg:text-6xl mb-4 inline-block px-6 py-3 bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            style={{ fontWeight: 800 }}
          >
            About Me
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Content Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              I'm a passionate developer and innovator who thrives at the intersection of cutting-edge technology and real-world impact. My work focuses on building systems that are not just functional, but transformative.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Whether it's architecting blockchain solutions, training AI models, or optimizing distributed systems, I approach every project with curiosity and a commitment to excellence.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              I believe in learning by building, experimenting fearlessly, and sharing knowledge with the community. My goal is to contribute to technologies that shape the future.
            </p>
          </motion.div>

          {/* Highlight Box */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Education Card */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-white/20 rounded-lg border-2 border-white/40">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl mb-2" style={{ fontWeight: 700 }}>
                    Education
                  </h3>
                  <p className="text-blue-100">
                    Bachelor of Technology in Computer Science
                  </p>
                  <p className="text-blue-100">
                    Expected Graduation: 2026
                  </p>
                  <p className="text-blue-100 mt-2 text-sm">
                    Focus: Distributed Systems, Machine Learning, Blockchain
                  </p>
                </div>
              </div>
            </div>

            {/* Core Interests */}
            <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(34,197,94,0.4)]">
              <h3 className="text-2xl mb-6" style={{ fontWeight: 700 }}>
                Core Interests
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg border-2 border-purple-300">
                    <Code2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <span style={{ fontWeight: 600 }}>Blockchain</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg border-2 border-pink-300">
                    <Brain className="w-5 h-5 text-pink-600" />
                  </div>
                  <span style={{ fontWeight: 600 }}>AI/ML</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg border-2 border-orange-300">
                    <Database className="w-5 h-5 text-orange-600" />
                  </div>
                  <span style={{ fontWeight: 600 }}>Systems</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg border-2 border-green-300">
                    <Code2 className="w-5 h-5 text-green-600" />
                  </div>
                  <span style={{ fontWeight: 600 }}>Research</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
