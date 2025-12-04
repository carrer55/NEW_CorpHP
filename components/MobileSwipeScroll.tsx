import React, { useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { DistortedImage } from './DistortedImage';
import { PrismaticArtifact } from './Scene';
import { Text3D, Center, MeshTransmissionMaterial, Float, Environment, Sparkles, Stars, Icosahedron, Sphere, useTexture, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { ViewState } from '../types';
import { PrivacyPolicyPage } from './ContentPages';
import { useAdaptiveQuality } from '../utils/performance';

// --- Mobile Scene Components ---

interface MobileHeroProps {
    isExiting: boolean;
}

const MobileHero: React.FC<MobileHeroProps> = ({ isExiting }) => {
    const { width } = useThree((state) => state.viewport);
    const { settings } = useAdaptiveQuality();
    const frameThrottle = useRef(0);
    const fontUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_bold.typeface.json';
    const groupRef = useRef<THREE.Group>(null);
    const sphereRef = useRef<THREE.Mesh>(null);
    const sphereMatRef = useRef<any>(null);
    const textMatRef = useRef<any>(null);
    const warpGroupRef = useRef<THREE.Group>(null);

    const sphereBaseY = 0.5;
    const sphereBaseZ = -1.2;
    const textBaseY = -0.1;

    const crystalMaterialProps = useMemo(() => ({
        samples: Math.round(4 * settings.geometryDetail),
        resolution: settings.transmissionResolution,
        thickness: 1.5,
        chromaticAberration: 1.0,
        anisotropy: 0.3,
        distortion: 0.4,
        distortionScale: 0.5,
        temporalDistortion: 0.2,
        iridescence: 1,
        iridescenceIOR: 1.2,
        iridescenceThicknessRange: [0, 1400] as [number, number],
        roughness: 0.0,
        color: "#eef2ff",
        background: new THREE.Color('#000000'),
        toneMapped: false,
    }), [settings]);

    useFrame((state, delta) => {
        if (!isExiting) {
            frameThrottle.current++;
            if (frameThrottle.current < settings.updateThrottle) return;
            frameThrottle.current = 0;
        }

        const time = state.clock.elapsedTime;

        if (sphereRef.current && groupRef.current) {
            
            if (isExiting) {
                // === EXIT: PORTAL ASCENSION ===
                // Speed tuned for 1000ms transition
                const exitSpeed = delta * 2.0;

                // 1. Sphere: Expands to cover screen
                sphereRef.current.scale.lerp(new THREE.Vector3(15, 15, 15), exitSpeed);
                // Move closer
                sphereRef.current.position.lerp(new THREE.Vector3(0, 0, 3), exitSpeed);
                
                // Material goes pure white
                if (sphereMatRef.current) {
                    sphereMatRef.current.color.lerp(new THREE.Color('#ffffff'), exitSpeed);
                    sphereMatRef.current.roughness = THREE.MathUtils.lerp(sphereMatRef.current.roughness, 0, exitSpeed);
                    sphereMatRef.current.thickness = THREE.MathUtils.lerp(sphereMatRef.current.thickness, 5.0, exitSpeed);
                }

                // 2. Text: Fade out instantly
                if (textMatRef.current) {
                    textMatRef.current.opacity = THREE.MathUtils.lerp(textMatRef.current.opacity, 0, exitSpeed * 2);
                }

                // 3. Warp Stars
                if (warpGroupRef.current) {
                    warpGroupRef.current.position.z += delta * 15.0;
                }

            } else {
                // === IDLE (STATIC) ===
                
                // --- Sphere Animation ---
                const targetScale = 0.7;
                sphereRef.current.scale.setScalar(targetScale);
                sphereRef.current.position.set(0, sphereBaseY, sphereBaseZ);

                // Rotation: Constant slow idle
                sphereRef.current.rotation.x = time * 0.15;
                sphereRef.current.rotation.y = time * 0.25;

                // Material: Clear Crystal
                if (sphereMatRef.current) {
                    sphereMatRef.current.roughness = 0.0;
                    sphereMatRef.current.transmission = 1;
                }

                // --- Text Animation ---
                const hoverY = Math.sin(time * 0.5) * 0.03;
                groupRef.current.position.set(0, textBaseY + hoverY, 0);
                groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.05;

                // Text Material: Visible
                if (textMatRef.current) {
                    textMatRef.current.opacity = 1;
                }
            }
        }
    });

    return (
        <group>
            <pointLight position={[-2, 1, 2]} intensity={8} color="#ffaaee" distance={5} />
            <pointLight position={[2, -1, 1]} intensity={8} color="#aaddff" distance={5} />

            {/* Sphere */}
            <mesh ref={sphereRef} position={[0, sphereBaseY, sphereBaseZ]} scale={0.7}>
                <sphereGeometry args={[1, 64, 64]} />
                <MeshTransmissionMaterial ref={sphereMatRef} {...crystalMaterialProps} transparent opacity={1} />
            </mesh>

            {/* Text */}
            <group ref={groupRef} position={[0, textBaseY, -10]}>
                <Center>
                    <Text3D
                        font={fontUrl}
                        size={width * 0.16}
                        height={0.25}
                        curveSegments={Math.round(12 * settings.geometryDetail)}
                        bevelEnabled
                        bevelThickness={0.03}
                        bevelSize={0.01}
                        bevelOffset={0}
                        bevelSegments={Math.round(3 * settings.geometryDetail)}
                        letterSpacing={-0.03}
                    >
                        FOUND
                        <MeshTransmissionMaterial 
                            ref={textMatRef}
                            {...crystalMaterialProps} 
                            backside 
                            samples={4}
                            transparent 
                            opacity={1}
                        />
                    </Text3D>
                </Center>
            </group>
            
            <group ref={warpGroupRef}>
                <Sparkles count={Math.round(60 * settings.particleCount)} scale={8} size={4} speed={0.4} opacity={0.5} color="#ffffff" />
                <Float speed={0.5} rotationIntensity={0.4} floatIntensity={0.4}>
                    <Sparkles
                        count={Math.max(1, Math.round(2 * settings.particleCount))}
                        scale={10}
                        size={12}
                        speed={0.1}
                        opacity={0.8}
                        color="#ffffff"
                    />
                </Float>
            </group>
        </group>
    );
};

interface Product3DCompositionProps {
    isExiting: boolean;
}

const Product3DComposition: React.FC<Product3DCompositionProps> = ({ isExiting }) => {
    const groupRef = useRef<THREE.Group>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);
    const { settings } = useAdaptiveQuality();
    const frameThrottle = useRef(0);
    const texture = useTexture("https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80");

    useFrame((state, delta) => {
        if (!isExiting) {
            frameThrottle.current++;
            if (frameThrottle.current < settings.updateThrottle) return;
            frameThrottle.current = 0;
        }

        const time = state.clock.elapsedTime;
        // Speed tuned for 1000ms transition
        const lerpSpeed = delta * 2.0; 

        if (groupRef.current && materialRef.current) {
            if (isExiting) {
                // === EXIT: LUXURIOUS DRIFT AWAY ===
                
                // 1. Position: Slowly drift backward into the deep void
                groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, -5.0, lerpSpeed);
                // Also drift slightly upward as if ascending
                groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0.5, lerpSpeed);

                // 2. Rotation: Gentle tilt away (nod)
                groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0.4, lerpSpeed);

                // 3. Opacity: Smooth fade out
                materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, 0, lerpSpeed * 1.5);
                // Slight scale down to enhance depth
                groupRef.current.scale.lerp(new THREE.Vector3(0.9, 0.9, 0.9), lerpSpeed);

            } else {
                // === ENTRY / IDLE: ELEGANT PRESENCE ===
                const entrySpeed = delta * 1.5;
                
                // 1. Position: Float at standard depth
                groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, -1.5, entrySpeed);
                // Center Y with simple Sine wave for idle
                const hoverY = Math.sin(time * 0.3) * 0.1;
                groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, hoverY, entrySpeed);

                // 2. Rotation: Very slow, majestic rotation
                // Reset X tilt from potential exit
                groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, Math.cos(time * 0.2) * 0.05, entrySpeed);
                // Y rotation for showcase
                groupRef.current.rotation.y = Math.sin(time * 0.25) * 0.12; 
                groupRef.current.rotation.z = Math.sin(time * 0.15) * 0.02;

                // 3. Scale & Opacity: Full visibility
                groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), entrySpeed);
                materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, 1, entrySpeed);
            }
        }
    });

    return (
        <group>
             <Sparkles count={Math.round(60 * settings.particleCount)} scale={8} size={4} speed={0.2} opacity={0.5} color="#ffffff" />
             <Float speed={0.3} rotationIntensity={0.2} floatIntensity={0.2}>
                <Sparkles count={Math.max(1, Math.round(2 * settings.particleCount))} scale={10} size={12} speed={0.05} opacity={0.8} color="#ffffff" />
             </Float>

             {/* Dynamic Lights for the panel - Gentle movement */}
             <pointLight position={[3, 2, 4]} intensity={1.5} color="#00ffff" distance={10} />
             <pointLight position={[-3, -2, -4]} intensity={1.5} color="#ff9900" distance={10} />

             {/* The Core: Simple Holographic Image Panel */}
             <group ref={groupRef} position={[0, -0.5, -1.5]} scale={1}> 
                <mesh>
                    <boxGeometry args={[2.5, 3.2, 0.1]} /> {/* Aspect ratio approx 3:4, thin slab */}
                    <meshStandardMaterial 
                        ref={materialRef}
                        map={texture} 
                        roughness={0.1} 
                        metalness={0.6}
                        emissiveMap={texture}
                        emissiveIntensity={0.2}
                        color="#ffffff"
                        transparent // Important for fade out
                        opacity={0} // Start invisible, lerp in
                    />
                </mesh>
             </group>
        </group>
    );
};

interface MobilePhilosophyDiamondProps {
    isExiting: boolean;
}

const MobilePhilosophyDiamond: React.FC<MobilePhilosophyDiamondProps> = ({ isExiting }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<any>(null);
    const { settings } = useAdaptiveQuality();
    const frameThrottle = useRef(0);

    useFrame((state, delta) => {
        if (!isExiting) {
            frameThrottle.current++;
            if (frameThrottle.current < settings.updateThrottle) return;
            frameThrottle.current = 0;
        }

        const time = state.clock.elapsedTime;
        const lerpSpeed = delta * 3.0;

        // Entry Lerp Speed: Slow and elegant
        const arrivalSpeed = delta * 0.8;

        if (meshRef.current && materialRef.current) {
            if (isExiting) {
                // === PRISMATIC WARP EXIT ===
                
                // 1. Move aggressively towards camera (to swallow it)
                meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, 2.5, lerpSpeed);
                
                // 2. Scale up massively
                meshRef.current.scale.lerp(new THREE.Vector3(6, 6, 6), lerpSpeed);
                
                // 3. High speed rotation
                meshRef.current.rotation.x += delta * 4;
                meshRef.current.rotation.y += delta * 8;

                // 4. Material craziness
                materialRef.current.distortion = THREE.MathUtils.lerp(materialRef.current.distortion, 3.0, lerpSpeed);
                materialRef.current.chromaticAberration = THREE.MathUtils.lerp(materialRef.current.chromaticAberration, 4.0, lerpSpeed);
                materialRef.current.thickness = THREE.MathUtils.lerp(materialRef.current.thickness, 4.0, lerpSpeed);

            } else {
                // === SF MOVIE ARRIVAL (ENTRY) & IDLE ===
                
                // 1. Position Arrival: From Foreground (5) to Background (-6)
                meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, -6.0, arrivalSpeed);
                
                // 2. Scale Arrival: Large background object
                meshRef.current.scale.lerp(new THREE.Vector3(3.5, 3.5, 3.5), arrivalSpeed);
                
                // 3. Rotation Deceleration:
                const targetIdleRotX = time * 0.15;
                const targetIdleRotY = time * 0.2;
                
                meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetIdleRotX, arrivalSpeed);
                meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetIdleRotY, arrivalSpeed);
                
                // 4. Floating (Only effective once near idle)
                const floatY = Math.sin(time * 0.4) * 0.15;
                meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, floatY, arrivalSpeed);

                // 5. Material Stabilization
                if (materialRef.current) {
                    materialRef.current.distortion = THREE.MathUtils.lerp(materialRef.current.distortion, 0.5, arrivalSpeed);
                    materialRef.current.chromaticAberration = THREE.MathUtils.lerp(materialRef.current.chromaticAberration, 1.2, arrivalSpeed);
                    materialRef.current.thickness = THREE.MathUtils.lerp(materialRef.current.thickness, 1.5, arrivalSpeed);
                }
            }
        }
    });

    return (
        <group>
             <Sparkles count={Math.round(40 * settings.particleCount)} scale={6} size={3} speed={0.3} opacity={0.5} color="#e0e0ff" />

             <pointLight position={[-3, 2, 2]} intensity={5} color="#00ffff" distance={10} />
             <pointLight position={[3, -2, -2]} intensity={5} color="#ff00ff" distance={10} />
             <pointLight position={[0, 0, 5]} intensity={2} color="#ffffff" distance={10} />

             <mesh
                ref={meshRef}
                position={[0, 0, 5]}
                scale={[0, 0, 0]}
                rotation={[0.5, 3, 0]}
             >
                <icosahedronGeometry args={[1, 0]} />
                <MeshTransmissionMaterial
                    ref={materialRef}
                    samples={Math.round(4 * settings.geometryDetail)}
                    resolution={settings.transmissionResolution}
                    thickness={4.0}
                    chromaticAberration={3.0}
                    anisotropy={0.3}
                    distortion={2.0}
                    distortionScale={0.5}
                    temporalDistortion={0.1}
                    iridescence={1}
                    iridescenceIOR={1.3}
                    roughness={0.0}
                    color="#f0f0ff"
                    toneMapped={false}
                />
             </mesh>
        </group>
    );
};

interface MobileKineticGridProps {
    isExiting: boolean;
}

const MobileKineticGrid: React.FC<MobileKineticGridProps> = ({ isExiting }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const { settings } = useAdaptiveQuality();
    const frameThrottle = useRef(0);
    const count = Math.round(10 * settings.geometryDetail);
    const total = count * count;
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const color = useMemo(() => new THREE.Color(), []);
    
    // Animation Progress Refs
    const entryProgress = useRef(0);
    const exitProgress = useRef(0);

    useFrame((state, delta) => {
        if (!isExiting) {
            frameThrottle.current++;
            if (frameThrottle.current < settings.updateThrottle) return;
            frameThrottle.current = 0;
        }

        const time = state.clock.elapsedTime;

        entryProgress.current = THREE.MathUtils.lerp(entryProgress.current, 1, delta * 1.5);
        
        // Exit: Speed up slightly for 1000ms transition
        if (isExiting) {
             exitProgress.current = THREE.MathUtils.lerp(exitProgress.current, 1, delta * 2.5);
        } else {
             exitProgress.current = 0;
        }

        const entry = entryProgress.current;
        const exit = exitProgress.current;

        // 2. Group Animations (Vortex Spin on Exit)
        if (groupRef.current) {
            // Idle rotation (Diagonal View)
            const baseRotX = Math.PI / 4;
            const baseRotY = Math.PI / 4;
            
            // Add idle wobble
            groupRef.current.rotation.x = baseRotX + (Math.sin(time * 0.2) * 0.05) * (1 - exit);
            groupRef.current.rotation.y = baseRotY + (time * 0.05) + (exit * time * 2.0); // Spin faster on exit
            
            // Move group towards camera on exit (Vortex Tunnel)
            groupRef.current.position.z = exit * 6.0; 
        }

        if (!meshRef.current) return;

        // 3. Update Individual Cubes
        let i = 0;
        for (let x = 0; x < count; x++) {
            for (let z = 0; z < count; z++) {
                const spread = 0.6 + (exit * 0.8); 
                const xPos = (x - count / 2) * spread;
                const zPos = (z - count / 2) * spread;
                const dist = Math.sqrt(xPos*xPos + zPos*zPos);
                
                // Wave Logic
                let yPos = Math.sin(dist * 2 - time * 2) * 0.5;
                yPos -= (1 - entry) * 8.0;
                
                dummy.position.set(xPos, yPos, zPos);
                
                // Rotation
                dummy.rotation.set(
                    Math.sin(x/4 + time) + yPos, 
                    exit * time * 5, 
                    Math.cos(z/4 + time) + yPos
                );
                
                // Scale
                let s = (Math.sin(x + z + time) * 0.5 + 0.5) * 0.8 + 0.2;
                s *= entry; 
                
                dummy.scale.set(s, s, s);
                dummy.updateMatrix();
                meshRef.current.setMatrixAt(i, dummy.matrix);
                
                color.setHSL(0.9 + ((Math.sin(dist * 3 - time) + 1) / 2) * 0.15, 1, 0.5);
                if (exit > 0) color.lerp(new THREE.Color('#ffffff'), exit);
                meshRef.current.setColorAt(i, color);
                i++;
            }
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <group>
            <spotLight position={[10, 10, 10]} intensity={1} />
            <ambientLight intensity={0.5} />

            <group ref={groupRef} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
                <instancedMesh ref={meshRef} args={[undefined, undefined, total]}>
                    <boxGeometry args={[0.22, 0.22, 0.22]} />
                    <meshStandardMaterial roughness={0.2} metalness={0.8} />
                </instancedMesh>
            </group>
        </group>
    );
};

const MobileBlackHoleMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorStart: new THREE.Color('#ff3300'),
    uColorEnd: new THREE.Color('#000000'),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = dot(viewDir, normal);
      fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
      fresnel = pow(fresnel, 3.0);
      
      vec3 color = mix(uColorEnd, uColorStart, fresnel * 0.8);
      float pulse = sin(uTime * 2.0) * 0.1 + 0.9;
      
      gl_FragColor = vec4(color * pulse, 1.0);
    }
  `
);
extend({ MobileBlackHoleMaterial });

interface MobileFloatingDotsProps {
    isExiting: boolean;
}

const MobileFloatingDots: React.FC<MobileFloatingDotsProps> = ({ isExiting }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const { settings } = useAdaptiveQuality();
    const frameThrottle = useRef(0);
    const count = Math.round(400 * settings.particleCount); 
    const dummy = useMemo(() => new THREE.Object3D(), []);
    
    const { radii, angles, speeds, yOffsets } = useMemo(() => {
        const radii = new Float32Array(count);
        const angles = new Float32Array(count);
        const speeds = new Float32Array(count);
        const yOffsets = new Float32Array(count);
        
        for (let i = 0; i < count; i++) {
            radii[i] = 1.8 + Math.random() * 3.2;
            angles[i] = Math.random() * Math.PI * 2;
            speeds[i] = 0.05 + Math.random() * 0.15;
            yOffsets[i] = (Math.random() - 0.5) * 0.4;
        }
        return { radii, angles, speeds, yOffsets };
    }, []);

    const entryProgress = useRef(0);
    const exitProgress = useRef(0);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        if (!isExiting) {
            frameThrottle.current++;
            if (frameThrottle.current < settings.updateThrottle) return;
            frameThrottle.current = 0;
        }

        const time = state.clock.elapsedTime;

        entryProgress.current = THREE.MathUtils.lerp(entryProgress.current, 1, delta * 1.5);
        
        if (isExiting) {
             exitProgress.current = THREE.MathUtils.lerp(exitProgress.current, 1, delta * 1.0);
        } else {
             exitProgress.current = 0;
        }
        
        const entry = entryProgress.current;
        const exit = exitProgress.current;

        const easedEntry = 1 - Math.pow(1 - entry, 3);

        for (let i = 0; i < count; i++) {
            const rBase = radii[i];
            const thetaBase = angles[i];
            const speed = speeds[i];
            const yBase = yOffsets[i];
            
            const radialDrift = Math.sin(time * 0.5 + i * 0.1) * 0.3; 
            const r = (rBase + radialDrift) * easedEntry;
            
            const angularDrift = Math.cos(time * 0.2 + i) * 0.2;
            const theta = thetaBase + time * (speed * 0.5) + angularDrift;
            
            const x = r * Math.cos(theta);
            const z = r * Math.sin(theta);
            
            const verticalWave = Math.sin(time * 0.3 + x * 0.5) * 0.2;
            const y = (yBase + verticalWave) * easedEntry;

            dummy.position.set(x, y, z);
            
            dummy.rotation.set(
                Math.sin(time * speed) * 0.5, 
                theta,
                Math.cos(time * speed * 0.5) * 0.5
            );
            
            let s = easedEntry; 
            s *= Math.max(0, 1.0 - exit * 1.6);
            
            dummy.scale.set(s, s, s);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <boxGeometry args={[0.04, 0.04, 0.04]} />
            <meshStandardMaterial color="#cccccc" roughness={0.5} metalness={0.5} />
        </instancedMesh>
    );
};

interface MobileSingularityProps {
    isExiting: boolean;
}

const MobileSingularity: React.FC<MobileSingularityProps> = ({ isExiting }) => {
    const blackHoleRef = useRef<THREE.Mesh>(null);
    const { settings } = useAdaptiveQuality();
    const frameThrottle = useRef(0);
    const entryProgress = useRef(0);
    const exitProgress = useRef(0);

    useFrame((state, delta) => {
        if (!isExiting) {
            frameThrottle.current++;
            if (frameThrottle.current < settings.updateThrottle) return;
            frameThrottle.current = 0;
        }

        const time = state.clock.elapsedTime;

        entryProgress.current = THREE.MathUtils.lerp(entryProgress.current, 1, delta * 1.5);
        
        if (isExiting) {
             // Standardized exit speed for 1000ms
             exitProgress.current = THREE.MathUtils.lerp(exitProgress.current, 1, delta * 1.0);
        } else {
             exitProgress.current = 0;
        }
        
        const entry = entryProgress.current;
        const exit = exitProgress.current;

        if (blackHoleRef.current) {
            // @ts-ignore
            blackHoleRef.current.material.uniforms.uTime.value = time;
            
            let scale = THREE.MathUtils.lerp(0, 1.2, Math.pow(entry, 2)); 
            
            if (exit > 0) {
                if (exit < 0.2) {
                    blackHoleRef.current.position.x = (Math.random() - 0.5) * 0.1;
                    blackHoleRef.current.position.y = -0.5 + (Math.random() - 0.5) * 0.1;
                } else {
                    blackHoleRef.current.position.set(0, -0.5, 0);
                }

                scale = THREE.MathUtils.lerp(1.2, 20, Math.pow(exit, 2.5));
            }
            
            blackHoleRef.current.scale.setScalar(scale);
        }
    });

    return (
        <group position={[0, -0.5, 0]}>
             <Sparkles count={Math.round(60 * settings.particleCount)} scale={8} size={4} speed={0.4} opacity={0.5} color="#ffffff" />
            <Float speed={0.5} rotationIntensity={0.4} floatIntensity={0.4}>
                <Sparkles
                    count={Math.max(1, Math.round(2 * settings.particleCount))}
                    scale={10}
                    size={12}
                    speed={0.1}
                    opacity={0.8}
                    color="#ffffff"
                />
            </Float>

            <mesh ref={blackHoleRef} scale={0}>
                <sphereGeometry args={[1.5, 32, 32]} /> 
                {/* @ts-ignore */}
                <mobileBlackHoleMaterial transparent />
            </mesh>
            
            <MobileFloatingDots isExiting={isExiting} />
            <pointLight position={[0, 0, 2]} color="#ff3300" intensity={2} distance={10} />
        </group>
    );
};

// --- Content Components ---

const Section1 = ({ isExiting }: { isExiting: boolean }) => (
    <motion.div 
        className="h-full flex flex-col items-center justify-center relative pointer-events-none"
        initial={{ opacity: 1 }} 
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ duration: 0.3 }}
    >
        <div className="flex flex-col items-center mt-32 md:mt-0">
             <div className="h-10" /> 
             <p className="text-gray-200 text-base font-inter tracking-wide font-medium mt-4">
                ひとつの点から世界を変える。
            </p>
        </div>
        
        <div className="absolute bottom-12 text-center animate-bounce opacity-80">
             <div className="text-2xl text-white mb-2">↓</div>
             <p className="text-white text-[10px] tracking-[0.3em] font-mono">SWIPE</p>
        </div>
    </motion.div>
);

const Section2 = ({ onNavigate }: { onNavigate?: (view: ViewState) => void }) => (
    <div className="h-full flex items-center justify-center p-6 pointer-events-none">
        <div className="text-center text-white z-10 w-full max-w-sm pointer-events-auto">
            <p className="text-orange-400 text-xs tracking-widest mb-4 font-mono drop-shadow-md">
                INNOVATIVE SOLUTION
            </p>
            <h2 className="text-4xl sm:text-6xl font-display font-bold tracking-wide mb-8 leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-xl">
                OUR<br/>PRODUCTS
            </h2>
            <div className="text-sm font-medium font-inter leading-relaxed text-white mb-8 space-y-2 drop-shadow-lg">
                <p>見過ごされた価値を発見し、</p>
                <p>一人ひとりが自分らしく輝く</p>
                <p>働き方を実現するソリューション。</p>
                <p className="pt-2">テクノロジーと人の「心」で、</p>
                <p>働くよろこびに満ちた未来を創ります。</p>
            </div>
            <button 
                onClick={() => onNavigate?.('PRODUCT')}
                className="px-8 py-3 border border-white text-xs tracking-widest hover:bg-white hover:text-black transition-all duration-300 font-mono bg-black/20 backdrop-blur-sm shadow-lg"
            >
                VIEW OUR PRODUCTS
            </button>
        </div>
    </div>
);

const Section3 = () => (
    <div className="h-full flex items-center justify-center p-4 sm:p-8 pointer-events-none">
        <div className="text-center text-white z-10 w-full">
            <p className="text-cyan-400 text-xs tracking-widest mb-4 font-mono drop-shadow-md">
                CORE OF THINKING
            </p>
            <h2 className="text-4xl sm:text-6xl font-display font-bold tracking-wide mb-8 leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-xl">
                OUR<br/>PHILOSOPHY
            </h2>
            <h3 className="text-base font-normal mb-8 leading-relaxed text-white drop-shadow-lg">
                【MISSION】<br/>
                人の「心」を起点としたテクノロジーで<br/>
                新たな仕組みを創造する
            </h3>
            <div className="text-sm font-normal font-inter leading-relaxed text-left max-w-xs mx-auto border-l-2 border-cyan-500 pl-4 text-white space-y-3 drop-shadow-md">
                <p>
                    私たちの使命は、現代社会に溢れる様々な課題や隠れた価値を「404 Not Found」から「.found（必ず見つける）」に変えることです。
                </p>
                <p>
                    人の温もりを大切にしながら、AI・テクノロジーの力で革新的なソリューションを提供し続けます。
                </p>
            </div>
        </div>
    </div>
);

const Section4 = ({ isExiting }: { isExiting: boolean }) => (
    <motion.div 
        className="h-full flex items-center justify-center p-8 pointer-events-none"
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ duration: 0.5 }}
    >
        <div className="text-center text-white z-10 w-full">
            <p className="text-fuchsia-400 text-xs tracking-widest mb-4 font-mono drop-shadow-md">
                POSITIVE CHANGE
            </p>
            <h2 className="text-4xl sm:text-6xl font-display font-bold tracking-wide mb-8 leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-xl">
                OUR<br/>VISION
            </h2>
            <h3 className="text-base font-normal mb-8 leading-relaxed text-white drop-shadow-lg">
                【VISION】<br/>
                自分らしく働くよろこびに満ちた<br/>
                未来を創る
            </h3>
            <div className="text-sm font-normal font-inter leading-relaxed text-left max-w-xs mx-auto border-l-2 border-fuchsia-500 pl-4 text-white space-y-3 drop-shadow-md">
                <p>
                    私たちは、働くという営みのあらゆる場面で一人ひとりが持つ無限の可能性を見つけ出し、それぞれが自分のいる場所で精一杯輝けるよう支援します。一つの小さな「点」から始まる物語が、隣の人へ、そして社会全体へと広がり、やがて世界中の人々の働くよろこびを照らし出す
                </p>
                <p>
                    ―――そんな未来を実現します。
                </p>
            </div>
        </div>
    </motion.div>
);

const Section5 = ({ isExiting }: { isExiting: boolean }) => (
    <motion.div 
        className="h-full flex items-center justify-center p-8 pointer-events-none"
        animate={isExiting ? "exit" : "enter"}
        variants={{
            enter: { opacity: 1, filter: "blur(0px)", scale: 1 },
            exit: { 
                opacity: 0, 
                filter: "blur(20px)", 
                scale: 1.1,
                y: -50,
                transition: { duration: 0.8, ease: "easeInOut" } 
            }
        }}
    >
        <div className="text-center text-white z-10 w-full">
            <p className="text-red-500 text-xs tracking-widest mb-6 font-mono drop-shadow-md">
                A SMALL YET PROFOUND BEGINNING
            </p>
            <h2 className="text-5xl font-display font-bold tracking-wider mb-8 leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-xl">
                [ .The DOT ]
            </h2>
            <div className="flex items-center justify-center gap-3 mb-8 drop-shadow-lg">
                <span className="w-8 h-[1px] bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)] inline-block"></span>
                <h3 className="text-base font-normal leading-relaxed text-white">
                    その小さくて大きな挑戦
                </h3>
            </div>
            <div className="text-sm font-normal font-inter leading-relaxed max-w-xs mx-auto text-white space-y-3 drop-shadow-md">
                <p>
                    私たちの社名に刻まれた「 . 」は、<br/>
                    人を中心とした、<br/>
                    つながりと可能性の起点を表しています。
                </p>
            </div>
        </div>
    </motion.div>
);

const ExpandSparkles = () => {
    const { settings } = useAdaptiveQuality();

    return (
        <group>
            <Sparkles count={Math.round(60 * settings.particleCount)} scale={8} size={4} speed={0.4} opacity={0.5} color="#ffffff" />
            <Float speed={0.5} rotationIntensity={0.4} floatIntensity={0.4}>
                <Sparkles count={Math.max(1, Math.round(2 * settings.particleCount))} scale={10} size={12} speed={0.1} opacity={0.8} color="#ffffff" />
            </Float>
        </group>
    );
};

const Section6 = ({ onNavigate, onOpenPrivacy }: { onNavigate?: (view: ViewState) => void, onOpenPrivacy: () => void }) => (
    <div className="h-full flex flex-col items-center justify-center p-8 pointer-events-none relative">
        <div className="text-center text-white z-10 w-full mb-20">
            <h2 className="text-5xl sm:text-6xl font-display font-bold tracking-tighter mb-12 leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent opacity-80 drop-shadow-2xl break-words w-full">
                A DOT<br/>EXPANDS
            </h2>
            
            <div className="text-sm font-normal font-inter leading-relaxed max-w-xs mx-auto text-white space-y-3 drop-shadow-md">
                <p>一つの小さな点から大きな波が生まれている。</p>
                <p>一人の小さな輝きが、<br/>今この瞬間も誰かの人生を変えている。</p>
            </div>
        </div>
        
        <footer className="absolute bottom-10 w-full text-center pointer-events-auto">
            <button 
                onClick={onOpenPrivacy} 
                className="text-xs font-mono text-gray-400 tracking-widest hover:text-white transition-colors mb-6 block mx-auto border-b border-gray-600 pb-1 w-fit"
            >
                PRIVACY POLICY
            </button>
            <p className="text-[10px] tracking-wide font-mono text-gray-600 uppercase">
                © 2025 .FOUND INC. ALL RIGHTS RESERVED.
            </p>
        </footer>
    </div>
);

interface MobileSwipeScrollProps {
    onNavigate: (view: ViewState) => void;
}

export const MobileSwipeScroll: React.FC<MobileSwipeScrollProps> = ({ onNavigate }) => {
    const [currentSection, setCurrentSection] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [heroExiting, setHeroExiting] = useState(false);
    const [productExiting, setProductExiting] = useState(false);
    const [philosophyExiting, setPhilosophyExiting] = useState(false);
    const [visionExiting, setVisionExiting] = useState(false);
    const [dotExiting, setDotExiting] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    
    const touchStartY = useRef(0);
    const touchEndY = useRef(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        touchEndY.current = e.changedTouches[0].clientY;
        handleSwipe();
    };

    const handleSwipe = () => {
        if (isTransitioning) return;

        const swipeDistance = touchStartY.current - touchEndY.current;
        const threshold = 50;
        
        // UNIFIED TRANSITION TIME (1000ms)
        const TRANSITION_TIME = 1000;
        const BUFFER_TIME = 200;

        if (Math.abs(swipeDistance) > threshold) {
            
            // Hero Section Exit Logic
            if (currentSection === 0 && swipeDistance > 0) { 
                setIsTransitioning(true);
                setHeroExiting(true);
                setTimeout(() => {
                    setCurrentSection(1);
                    setHeroExiting(false);
                    setTimeout(() => setIsTransitioning(false), 100); 
                }, TRANSITION_TIME); 
                return;
            }

            // Products Section Exit Logic
            if (currentSection === 1) {
                setIsTransitioning(true);
                setProductExiting(true);
                setTimeout(() => {
                    if (swipeDistance > 0) setCurrentSection(2);
                    else setCurrentSection(0);
                    setProductExiting(false);
                    setTimeout(() => setIsTransitioning(false), BUFFER_TIME);
                }, TRANSITION_TIME); 
                return;
            }

            // Philosophy Section Exit Logic
            if (currentSection === 2) {
                setIsTransitioning(true);
                setPhilosophyExiting(true);
                setTimeout(() => {
                    if (swipeDistance > 0) setCurrentSection(3);
                    else setCurrentSection(1);
                    setPhilosophyExiting(false);
                    setTimeout(() => setIsTransitioning(false), BUFFER_TIME);
                }, TRANSITION_TIME);
                return;
            }

            // Vision Section Exit Logic
            if (currentSection === 3) {
                setIsTransitioning(true);
                setVisionExiting(true);
                setTimeout(() => {
                    if (swipeDistance > 0) setCurrentSection(4);
                    else setCurrentSection(2);
                    setVisionExiting(false);
                    setTimeout(() => setIsTransitioning(false), BUFFER_TIME);
                }, TRANSITION_TIME); 
                return;
            }

            // Dot Section Exit Logic
            if (currentSection === 4) {
                setIsTransitioning(true);
                setDotExiting(true);
                setTimeout(() => {
                    if (swipeDistance > 0) setCurrentSection(5);
                    else setCurrentSection(3);
                    setDotExiting(false);
                    setTimeout(() => setIsTransitioning(false), BUFFER_TIME);
                }, TRANSITION_TIME); 
                return;
            }

            setIsTransitioning(true);
            if (swipeDistance > 0 && currentSection < 5) {
                setCurrentSection(prev => prev + 1);
            } else if (swipeDistance < 0 && currentSection > 0) {
                setCurrentSection(prev => prev - 1);
            }

            setTimeout(() => setIsTransitioning(false), 800);
        }
    };

    const scrollToSection = (index: number) => {
        const TRANSITION_TIME = 1000;
        const BUFFER_TIME = 200;

        if (!isTransitioning && index !== currentSection) {
            if (currentSection === 0 && index > 0) {
                setIsTransitioning(true);
                setHeroExiting(true);
                setTimeout(() => {
                    setCurrentSection(index);
                    setHeroExiting(false);
                    setTimeout(() => setIsTransitioning(false), BUFFER_TIME);
                }, TRANSITION_TIME);
            } else if (currentSection === 1 && index !== 1) {
                setIsTransitioning(true);
                setProductExiting(true);
                setTimeout(() => {
                    setCurrentSection(index);
                    setProductExiting(false);
                    setTimeout(() => setIsTransitioning(false), BUFFER_TIME);
                }, TRANSITION_TIME); 
            } else if (currentSection === 2 && index !== 2) {
                setIsTransitioning(true);
                setPhilosophyExiting(true);
                setTimeout(() => {
                    setCurrentSection(index);
                    setPhilosophyExiting(false);
                    setTimeout(() => setIsTransitioning(false), BUFFER_TIME);
                }, TRANSITION_TIME);
            } else if (currentSection === 3 && index !== 3) {
                setIsTransitioning(true);
                setVisionExiting(true);
                setTimeout(() => {
                    setCurrentSection(index);
                    setVisionExiting(false);
                    setTimeout(() => setIsTransitioning(false), BUFFER_TIME);
                }, TRANSITION_TIME);
            } else if (currentSection === 4 && index !== 4) {
                setIsTransitioning(true);
                setDotExiting(true);
                setTimeout(() => {
                    setCurrentSection(index);
                    setDotExiting(false);
                    setTimeout(() => setIsTransitioning(false), BUFFER_TIME);
                }, TRANSITION_TIME);
            } else {
                setIsTransitioning(true);
                setCurrentSection(index);
                setTimeout(() => setIsTransitioning(false), 800);
            }
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-[#050505] overflow-hidden select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Whiteout Flash Overlay (Only for Hero Warp) */}
            <AnimatePresence>
                {(heroExiting) && (
                    <motion.div 
                        className="fixed inset-0 bg-white z-[30] pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.5, delay: 0 } }} 
                        transition={{ duration: 0.2, ease: "easeIn", delay: 0.8 }}
                    />
                )}
            </AnimatePresence>
            
            {/* Blackout Overlay for Dot Section Exit (Hide stars) */}
            <AnimatePresence>
                {(dotExiting) && (
                    <motion.div 
                        className="fixed inset-0 bg-[#050505] z-[30] pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeInOut", delay: 0.4 }}
                    />
                )}
            </AnimatePresence>

            {/* Navigation Indicators */}
            <div className="absolute inset-x-0 top-24 bottom-8 pointer-events-none z-40 flex flex-col justify-between">
                <div className="flex justify-center h-8">
                    {currentSection > 0 && (
                        <motion.div 
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                            className="opacity-50"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="w-4 h-4 rotate-180">
                                <path d="M12 21l-12-18h24z"/>
                            </svg>
                        </motion.div>
                    )}
                </div>

                <div className="flex justify-center h-8">
                    {currentSection < 5 && currentSection !== 0 && (
                        <motion.div 
                            animate={{ y: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                            className="opacity-50"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                                <path d="M12 21l-12-18h24z"/>
                            </svg>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* 3D Canvas */}
            <div className="absolute inset-0 z-0" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]} gl={{ powerPreference: 'high-performance' }}>
                    <color attach="background" args={['#050505']} />
                    <Environment preset="city" />
                    <ambientLight intensity={0.5} />
                    
                    <Suspense fallback={null}>
                        {currentSection === 0 && (
                            <group key="hero">
                                <MobileHero isExiting={heroExiting} />
                            </group>
                        )}
                        {currentSection === 1 && (
                            <group key="products">
                                <Product3DComposition isExiting={productExiting} />
                            </group>
                        )}
                        {currentSection === 2 && (
                            <group key="philosophy">
                                <MobilePhilosophyDiamond isExiting={philosophyExiting} />
                            </group>
                        )}
                        {currentSection === 3 && (
                            <group key="vision">
                                <MobileKineticGrid isExiting={visionExiting} />
                            </group>
                        )}
                        {currentSection === 4 && (
                            <group key="dot">
                                <MobileSingularity isExiting={dotExiting} />
                            </group>
                        )}
                        {currentSection === 5 && (
                            <ExpandSparkles key="expand" />
                        )}
                    </Suspense>
                </Canvas>
            </div>

            {/* Content Overlays */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSection}
                    initial={currentSection === 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute inset-0 z-10"
                >
                    {currentSection === 0 && <Section1 isExiting={heroExiting} />}
                    {currentSection === 1 && <Section2 onNavigate={onNavigate} />}
                    {currentSection === 2 && <Section3 />}
                    {currentSection === 3 && <Section4 isExiting={visionExiting} />}
                    {currentSection === 4 && <Section5 isExiting={dotExiting} />}
                    {currentSection === 5 && <Section6 onNavigate={onNavigate} onOpenPrivacy={() => setShowPrivacyModal(true)} />}
                </motion.div>
            </AnimatePresence>

            {/* Page Indicator */}
            <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                    <motion.div
                        key={index}
                        onClick={() => scrollToSection(index)}
                        className="cursor-pointer relative flex items-center justify-center w-4 h-4"
                    >
                        {currentSection === index && (
                            <motion.div 
                                layoutId="activeRing"
                                className="absolute inset-0 border border-white rounded-full"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <div
                            className={`rounded-full transition-all duration-300 ${
                                currentSection === index
                                    ? 'w-1.5 h-1.5 bg-white'
                                    : 'w-1 h-1 bg-white/30 hover:bg-white/50'
                            }`}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Privacy Policy Modal */}
            {createPortal(
                <AnimatePresence>
                    {showPrivacyModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                            onClick={() => setShowPrivacyModal(false)}
                        >
                            <motion.div 
                                initial={{ scale: 0.95, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.95, y: 20 }}
                                className="bg-[#050505] border border-gray-800 w-full max-w-lg h-[80vh] flex flex-col relative rounded-sm shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="absolute top-4 right-4 z-50">
                                    <button 
                                        onClick={() => setShowPrivacyModal(false)}
                                        className="p-2 text-white hover:text-cyan-400 transition-colors bg-black/50 rounded-full"
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                    <PrivacyPolicyPage onNavigate={() => setShowPrivacyModal(false)} isModal={true} />
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};