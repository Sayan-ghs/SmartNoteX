import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

interface CharacterProps {
  scrollProgress: number;
  sectionIndex: number;
  gesture: 'idle' | 'nod' | 'wave' | 'point';
}

function Character({ scrollProgress, sectionIndex, gesture }: CharacterProps) {
  const groupRef = useRef<any>(null);
  const headRef = useRef<any>(null);
  const leftArmRef = useRef<any>(null);
  const rightArmRef = useRef<any>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    timeRef.current += delta;
    
    if (!groupRef.current || !headRef.current) return;

    // Idle breathing animation
    const breathe = Math.sin(timeRef.current * 2) * 0.02;
    groupRef.current.position.y = breathe;

    // Head bobbing
    headRef.current.rotation.y = Math.sin(timeRef.current * 1.5) * 0.1;
    headRef.current.rotation.x = Math.sin(timeRef.current * 1.2) * 0.05;

    // Gesture animations
    if (gesture === 'wave' && rightArmRef.current) {
      rightArmRef.current.rotation.z = Math.sin(timeRef.current * 4) * 0.5 - 0.3;
    } else if (gesture === 'point' && leftArmRef.current) {
      leftArmRef.current.rotation.z = 0.5;
      leftArmRef.current.rotation.x = -0.3;
    } else if (gesture === 'nod' && headRef.current) {
      headRef.current.rotation.x = Math.sin(timeRef.current * 3) * 0.15;
    }

    // Rotate to face section side
    const targetRotation = sectionIndex % 2 === 0 ? Math.PI * 0.15 : -Math.PI * 0.15;
    groupRef.current.rotation.y += (targetRotation - groupRef.current.rotation.y) * delta * 2;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.4, 0.8, 8, 16]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.12, 0.95, 0.3]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.12, 0.95, 0.3]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Smile */}
      <mesh position={[0, 0.8, 0.32]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.08, 0.02, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.45, 0.2, 0]}>
        <mesh position={[0, -0.3, 0]}>
          <capsuleGeometry args={[0.12, 0.5, 8, 16]} />
          <meshStandardMaterial color="#6366f1" />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.6, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.45, 0.2, 0]}>
        <mesh position={[0, -0.3, 0]}>
          <capsuleGeometry args={[0.12, 0.5, 8, 16]} />
          <meshStandardMaterial color="#6366f1" />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.6, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      </group>

      {/* Legs */}
      <group position={[0, -0.6, 0]}>
        <mesh position={[-0.15, -0.4, 0]}>
          <capsuleGeometry args={[0.14, 0.6, 8, 16]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.15, -0.4, 0]}>
          <capsuleGeometry args={[0.14, 0.6, 8, 16]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Shoes */}
      <mesh position={[-0.15, -1.1, 0.1]}>
        <boxGeometry args={[0.2, 0.1, 0.3]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0.15, -1.1, 0.1]}>
        <boxGeometry args={[0.2, 0.1, 0.3]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
    </group>
  );
}

interface Avatar3DProps {
  scrollProgress: number;
  sectionIndex: number;
  gesture?: 'idle' | 'nod' | 'wave' | 'point';
  className?: string;
}

export function Avatar3D({ scrollProgress, sectionIndex, gesture = 'idle', className = '' }: Avatar3DProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0.5, 4], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, 3, -5]} intensity={0.3} />
        <Character 
          scrollProgress={scrollProgress} 
          sectionIndex={sectionIndex}
          gesture={gesture}
        />
      </Canvas>
    </div>
  );
}
