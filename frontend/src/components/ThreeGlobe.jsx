import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';

function Globe() {
    const meshRef = useRef();

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.1;
            meshRef.current.rotation.x += delta * 0.05;
        }
    });

    return (
        <Sphere ref={meshRef} args={[2.5, 32, 32]}>
            <meshBasicMaterial
                color="#00ffcc"
                wireframe={true}
                transparent={true}
                opacity={0.3}
            />
        </Sphere>
    );
}

export default function ThreeGlobe() {
    return (
        <div className="w-full h-full min-h-[400px] flex items-center justify-center relative">
            <div className="absolute inset-0 bg-aegis-accent-glow blur-[100px] opacity-20 rounded-full scale-75" />
            <Canvas camera={{ position: [0, 0, 6] }}>
                <Globe />
            </Canvas>
        </div>
    );
}
