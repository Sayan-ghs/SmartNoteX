import { motion } from 'framer-motion';
import { Blocks, Zap, Shield, Rocket, Code, Database } from 'lucide-react';

const skills = [
  { name: 'Blockchain & Web3', icon: Blocks, color: 'from-purple-500 to-indigo-500' },
  { name: 'AI & Machine Learning', icon: Zap, color: 'from-pink-500 to-rose-500' },
  { name: 'Distributed Systems', icon: Database, color: 'from-blue-500 to-cyan-500' },
  { name: 'Security & Cryptography', icon: Shield, color: 'from-green-500 to-emerald-500' },
  { name: 'Full-stack Development', icon: Code, color: 'from-orange-500 to-yellow-500' },
  { name: 'Performance Optimization', icon: Rocket, color: 'from-red-500 to-orange-500' },
];

export function SkillsSection() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 
            className="text-5xl lg:text-6xl mb-4 inline-block px-6 py-3 bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            style={{ fontWeight: 800 }}
          >
            What I'm Good At
          </h2>
          <p className="text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
            A fusion of technical depth and innovative thinking
          </p>
        </motion.div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skills.map((skill, index) => {
            const Icon = skill.icon;
            return (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotate: 1 }}
                className="relative group"
              >
                {/* Card */}
                <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 h-full flex flex-col items-center justify-center text-center space-y-4">
                  {/* Icon */}
                  <div className={`p-6 bg-gradient-to-br ${skill.color} rounded-2xl border-4 border-black group-hover:rotate-12 transition-transform duration-300`}>
                    <Icon className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  
                  {/* Title */}
                  <h3 
                    className="text-xl"
                    style={{ fontWeight: 700 }}
                  >
                    {skill.name}
                  </h3>
                </div>

                {/* Decorative dot */}
                <div className={`absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br ${skill.color} rounded-full border-2 border-black group-hover:scale-150 transition-transform duration-300`} />
              </motion.div>
            );
          })}
        </div>

        {/* Bottom accent text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            I don't just write code — I architect solutions, solve complex problems, and push the boundaries of what's possible with technology.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
