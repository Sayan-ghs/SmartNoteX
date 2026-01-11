import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  problem: string;
  solution: string;
  techStack: string[];
  accentColor: string;
  link?: string;
}

const projects: Project[] = [
  {
    id: '1',
    title: 'Decentralized Identity Protocol',
    problem: 'Traditional identity systems are centralized and vulnerable to breaches',
    solution: 'Built a blockchain-based self-sovereign identity system with zero-knowledge proofs',
    techStack: ['Solidity', 'Ethereum', 'IPFS', 'React', 'ZK-SNARKs'],
    accentColor: 'from-blue-500 to-cyan-500',
    link: '#'
  },
  {
    id: '2',
    title: 'AI-Powered Code Review Assistant',
    problem: 'Manual code reviews are time-consuming and inconsistent',
    solution: 'Developed an ML model that provides intelligent code suggestions and detects patterns',
    techStack: ['Python', 'PyTorch', 'Transformers', 'FastAPI', 'Docker'],
    accentColor: 'from-purple-500 to-pink-500',
    link: '#'
  },
  {
    id: '3',
    title: 'Distributed Task Scheduler',
    problem: 'Scaling task execution across multiple nodes is complex',
    solution: 'Created a fault-tolerant distributed system with dynamic load balancing',
    techStack: ['Go', 'Kubernetes', 'Redis', 'gRPC', 'Prometheus'],
    accentColor: 'from-orange-500 to-red-500',
    link: '#'
  },
  {
    id: '4',
    title: 'Real-time Collaborative Editor',
    problem: 'Existing collaborative tools lack proper conflict resolution',
    solution: 'Implemented CRDT-based synchronization for seamless multi-user editing',
    techStack: ['TypeScript', 'WebRTC', 'Yjs', 'Node.js', 'WebSockets'],
    accentColor: 'from-green-500 to-emerald-500',
    link: '#'
  },
  {
    id: '5',
    title: 'Predictive Analytics Dashboard',
    problem: 'Business decisions lack data-driven insights',
    solution: 'Built an analytics platform with ML forecasting and interactive visualizations',
    techStack: ['React', 'D3.js', 'Python', 'TensorFlow', 'PostgreSQL'],
    accentColor: 'from-yellow-500 to-orange-500',
    link: '#'
  },
  {
    id: '6',
    title: 'Smart Contract Auditing Tool',
    problem: 'Security vulnerabilities in smart contracts lead to exploits',
    solution: 'Developed static analysis tool to detect common vulnerabilities and gas optimizations',
    techStack: ['Rust', 'Solidity', 'Foundry', 'LLVM', 'WebAssembly'],
    accentColor: 'from-indigo-500 to-purple-500',
    link: '#'
  }
];

export function ProjectsSection() {
  return (
    <section id="projects" className="min-h-screen px-6 py-20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 
            className="text-5xl lg:text-6xl mb-4 inline-block px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-400 border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            style={{ fontWeight: 800 }}
          >
            Featured Projects
          </h2>
          <p className="text-xl text-gray-600 mt-6 max-w-2xl">
            Real problems. Innovative solutions. Technology that matters.
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 overflow-hidden"
            >
              {/* Accent Header */}
              <div className={`h-2 bg-gradient-to-r ${project.accentColor}`} />
              
              <div className="p-6 space-y-4">
                {/* Title */}
                <h3 
                  className="text-2xl group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-500 transition-all"
                  style={{ fontWeight: 700 }}
                >
                  {project.title}
                </h3>

                {/* Problem & Solution */}
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded border border-red-300 text-xs mb-1" style={{ fontWeight: 600 }}>
                      Problem
                    </span>
                    <p className="text-gray-600">{project.problem}</p>
                  </div>
                  <div>
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded border border-green-300 text-xs mb-1" style={{ fontWeight: 600 }}>
                      Solution
                    </span>
                    <p className="text-gray-600">{project.solution}</p>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-xs bg-gray-100 border-2 border-black rounded-lg"
                      style={{ fontWeight: 600 }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="pt-4 flex gap-3">
                  <a
                    href={project.link}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-black text-white border-2 border-black rounded-lg hover:bg-gray-800 transition-colors"
                    style={{ fontWeight: 600 }}
                  >
                    View Project
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href="#"
                    className="p-3 bg-white border-2 border-black rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
