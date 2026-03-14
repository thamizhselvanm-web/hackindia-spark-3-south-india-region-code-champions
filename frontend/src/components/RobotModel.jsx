import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function RobotModel({ isResponding }) {
  const group = useRef();
  const headRef = useRef();
  
  const targetRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      // Normalize mouse coordinates to -1 to +1
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      targetRotation.current.x = y * 0.4;
      targetRotation.current.y = x * 0.6;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (!group.current) return;

    const time = state.clock.getElapsedTime();

    // Floating effect
    const floatY = Math.sin(time * 2.5) * 0.1;
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, -0.5 + floatY, 0.1);

    // Idle slow rotation
    const idleY = Math.sin(time * 0.8) * 0.15;
    
    // Look at mouse smoothly
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y, 
      targetRotation.current.y + idleY, 
      0.08
    );
    
    if (headRef.current) {
        headRef.current.rotation.x = THREE.MathUtils.lerp(
            headRef.current.rotation.x, 
            -targetRotation.current.x, 
            0.1
        );
    }

    // Bounce when responding
    if (isResponding) {
      group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, 1.08, 0.15));
      group.current.rotation.z = Math.sin(time * 20) * 0.05;
    } else {
      group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, 1.0, 0.1));
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, 0, 0.1);
    }
  });

  // Materials
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 });
  const greyMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5, metalness: 0.8 });
  const glowMat = new THREE.MeshStandardMaterial({ color: 0x818cf8, emissive: 0x6366f1, emissiveIntensity: 0.8 });
  const screenMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.5 });

  return (
    <group ref={group} position={[0, -0.5, 0]}>
        {/* Floating Base Ring */}
        <mesh material={glowMat} position={[0, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.5, 0.06, 16, 32]} />
        </mesh>

        {/* Body Structure */}
        <mesh material={whiteMat} position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.6, 0.4, 1.1, 32]} />
        </mesh>

        {/* Neck joint */}
        <mesh material={greyMat} position={[0, 0.9, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.3]} />
        </mesh>

        {/* Head Structure */}
        <group ref={headRef} position={[0, 1.3, 0]}>
            {/* Main Head Box */}
            <mesh material={whiteMat} castShadow>
                <boxGeometry args={[1.2, 0.9, 1.1]} />
            </mesh>

            {/* Screen/Visor */}
            <mesh material={screenMat} position={[0, 0.1, 0.56]}>
                <boxGeometry args={[0.9, 0.4, 0.1]} />
            </mesh>

            {/* Eyes (Glowing) */}
            <mesh material={glowMat} position={[-0.2, 0.1, 0.6]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.06, 0.1, 4, 8]} />
            </mesh>
            <mesh material={glowMat} position={[0.2, 0.1, 0.6]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.06, 0.1, 4, 8]} />
            </mesh>

            {/* Antennas */}
            <mesh material={greyMat} position={[-0.65, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
                <cylinderGeometry args={[0.03, 0.03, 0.4]} />
            </mesh>
            <mesh material={greyMat} position={[0.65, 0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
                <cylinderGeometry args={[0.03, 0.03, 0.4]} />
            </mesh>
        </group>
    </group>
  );
}
