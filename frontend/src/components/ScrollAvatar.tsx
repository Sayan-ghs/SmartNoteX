import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ScrollAvatarProps {
  sections: string[];
}

export function ScrollAvatar({ sections }: ScrollAvatarProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [gesture, setGesture] = useState<'idle' | 'nod' | 'wave' | 'point'>('idle');
  const { scrollYProgress } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);

  // Map scroll progress to vertical position
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '400%']);

  // Determine which side the avatar should be on
  const isLeftSide = currentSection % 2 === 1;

  useEffect(() => {
    const handleScroll = () => {
      // Calculate which section is currently in view
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      const sectionElements = sections
        .map(id => document.getElementById(id))
        .filter(el => el !== null);

      let newSection = 0;
      sectionElements.forEach((el, index) => {
        if (el && scrollPosition >= el.offsetTop) {
          newSection = index;
        }
      });

      if (newSection !== currentSection) {
        setCurrentSection(newSection);
        
        // Trigger gesture on section change
        const gestures: Array<'idle' | 'nod' | 'wave' | 'point'> = ['nod', 'wave', 'point'];
        setGesture(gestures[Math.floor(Math.random() * gestures.length)]);
        
        setTimeout(() => setGesture('idle'), 2000);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentSection, sections]);

  // Get caption text based on section
  const getCaptionText = () => {
    switch (currentSection) {
      case 0: return "Hi there! 👋";
      case 1: return "Let me tell you more...";
      case 2: return "Check out my work!";
      case 3: return "Here's what I do best";
      case 4: return "Let's connect!";
      default: return "Hi there! 👋";
    }
  };

  // Get emoji based on gesture and section
  const getEmoji = () => {
    if (gesture === 'wave') return '👋';
    if (gesture === 'point') return '👉';
    if (gesture === 'nod') return '👍';
    
    // Default based on section
    switch (currentSection) {
      case 0: return '👨‍💻';
      case 1: return '🎓';
      case 2: return '🚀';
      case 3: return '⚡';
      case 4: return '📬';
      default: return '👨‍💻';
    }
  };

  return (
    <>
      {/* Desktop Avatar */}
      <motion.div
        ref={containerRef}
        className="hidden lg:block fixed top-20 z-40 pointer-events-none"
        style={{
          y,
          left: isLeftSide ? '2rem' : 'auto',
          right: isLeftSide ? 'auto' : '2rem',
        }}
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          x: isLeftSide ? 0 : 0,
          transition: { 
            opacity: { duration: 0.5 },
            x: { duration: 0.6, type: 'spring' }
          }
        }}
      >
        {/* Avatar Container Card */}
        <motion.div
          animate={{
            x: isLeftSide ? 0 : 0,
            transition: { duration: 0.6, type: 'spring', stiffness: 100 }
          }}
          className="w-64 h-80 bg-gradient-to-br from-white to-gray-50 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative"
        >
          {/* Animated Avatar Character */}
          <div className="w-full h-full flex items-center justify-center relative">
            {/* Avatar illustration */}
            <motion.div
              animate={{
                y: gesture === 'nod' ? [0, -10, 0] : 0,
                x: gesture === 'point' ? (isLeftSide ? 20 : -20) : 0,
                rotate: gesture === 'wave' ? [0, 10, -10, 10, 0] : 0,
              }}
              transition={{
                duration: gesture === 'idle' ? 2 : 0.5,
                repeat: gesture === 'idle' ? Infinity : 1,
                ease: 'easeInOut'
              }}
              className="text-8xl relative z-10"
            >
              {getEmoji()}
            </motion.div>

            {/* Animated background circles */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute w-32 h-32 bg-blue-400 rounded-full blur-xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1.5
              }}
              className="absolute w-40 h-40 bg-purple-400 rounded-full blur-xl"
            />
          </div>
          
          {/* Caption */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-white text-center py-2 px-3 border-t-4 border-white">
            <p className="text-xs" style={{ fontWeight: 600 }}>
              {getCaptionText()}
            </p>
          </div>
        </motion.div>

        {/* Decorative elements */}
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear'
          }}
          className={`absolute -top-3 ${isLeftSide ? '-right-3' : '-left-3'} w-8 h-8 bg-yellow-400 rounded-full border-4 border-black`} 
        />
        <motion.div 
          animate={{
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className={`absolute -bottom-3 ${isLeftSide ? '-left-3' : '-right-3'} w-6 h-6 bg-green-400 rounded-full border-4 border-black`} 
        />
      </motion.div>
    </>
  );
}
