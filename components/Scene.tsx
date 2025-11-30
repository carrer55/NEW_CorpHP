import React, { useRef, useMemo } from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
import { useScroll, Environment, Float, Sparkles, MeshTransmissionMaterial, shaderMaterial, ScrollControls, Scroll, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';
import { DistortedImage } from './DistortedImage';
import { Overlay } from './Overlay';
import { ViewState } from '../types';

// --- Custom Shaders and Components (Reused) ---

const BlackHoleMaterial = shaderMaterial(
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

extend({ BlackHoleMaterial });

const MovingLight = () => {
    const lightRef = useRef<THREE.SpotLight>(null);
    useFrame((state) => {
        if (lightRef.current) {
            const time = state.clock.elapsedTime;
            lightRef.current.position.x = Math.sin(time * 0.5) * 5;
            lightRef.current.position.y = Math.cos(time * 0.3) * 3;
            lightRef.current.position.z = 2 + Math.sin(time * 0.2);
        }
    });
    return (
        <spotLight
            ref={lightRef}
            position={[0, 0, 2]}
            intensity={20}
            angle={0.5}
            penumbra={1}
            color="#ffffff"
            distance={10}
        />
    )
}

const HeroComposition = () => {
    const sphereRef = useRef<THREE.Mesh>(null);
    const textGroupRef = useRef<THREE.Group>(null);
    const sphereMatRef = useRef<any>(null);
    const scroll = useScroll();
    const { width, height } = useThree((state) => state.viewport);
    const isMobile = width < 5;
    
    // Font URL for 3D Text
    const fontUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_bold.typeface.json';

    // Colors
    // Match the text's icy tint initially (#eef2ff), transition to pure white (#ffffff)
    const initialColor = useMemo(() => new THREE.Color('#eef2ff'), []); 
    const targetColor = useMemo(() => new THREE.Color('#ffffff'), []);

    // Responsive Configuration
    const sphereStartScale = isMobile ? 0.14 : 0.20; 
    const textSize = isMobile ? 0.28 : 0.9;
    
    // Layout Calculations
    const sphereRadius = sphereStartScale; 
    const textApproxWidth = textSize * (isMobile ? 4.5 : 4.2); 
    const gap = isMobile ? 0.15 : 0.5;
    const totalWidth = (sphereRadius * 2) + gap + textApproxWidth;
    
    const groupStartX = -totalWidth / 2;
    const sphereStartX = groupStartX + sphereRadius;
    const textStartX = groupStartX + (sphereRadius * 2) + gap + (textApproxWidth / 2);

    const sphereStartY = isMobile ? -0.2 : -0.3;

    // Unified Crystal Material Settings (Performance Optimized)
    const crystalMaterialProps = {
        samples: isMobile ? 3 : 5, // Reduced from 4/8
        resolution: isMobile ? 256 : 512, // Reduced from 512/1024
        thickness: isMobile ? 1.0 : 1.5,
        chromaticAberration: 1.0, 
        anisotropy: 0.1, // Reduced from 0.5
        distortion: 0.2, 
        distortionScale: 0.4,
        temporalDistortion: 0.15, 
        iridescence: 1,
        iridescenceIOR: 1.2,
        iridescenceThicknessRange: [0, 1400] as [number, number],
        roughness: 0.1, 
        color: "#eef2ff",
        background: new THREE.Color('#000000'),
        toneMapped: false,
    };

    useFrame((state) => {
        const range = scroll.range(0, 0.25);
        const ease = THREE.MathUtils.smoothstep(range, 0, 1);
        const aggressiveEase = Math.pow(ease, 3);

        const time = state.clock.elapsedTime;
        
        if (sphereRef.current) {
            // 1. Position: Move Sphere towards the Text horizontally
            const currentX = THREE.MathUtils.lerp(sphereStartX, textStartX, ease);
            const currentY = THREE.MathUtils.lerp(sphereStartY, 0, aggressiveEase);
            const currentZ = THREE.MathUtils.lerp(0, 0.5, aggressiveEase);

            sphereRef.current.position.set(currentX, currentY, currentZ);

            // 2. Scale
            const targetScale = isMobile ? 3.5 : 2.5; 
            const currentScale = THREE.MathUtils.lerp(sphereStartScale, targetScale, aggressiveEase);
            sphereRef.current.scale.setScalar(currentScale);

            // 3. Rotation
            sphereRef.current.rotation.x = time * 0.3 + ease * Math.PI;
            sphereRef.current.rotation.y = time * 0.4 + ease * Math.PI * 2;
            sphereRef.current.rotation.z = ease * Math.PI * 0.5; 
        }
        
        // Material Metamorphosis
        if (sphereMatRef.current) {
            // Color Lerp
            sphereMatRef.current.color.lerpColors(initialColor, targetColor, ease);
            
            // Dynamic Material Properties
            sphereMatRef.current.distortion = THREE.MathUtils.lerp(crystalMaterialProps.distortion, 0.6, ease);
            sphereMatRef.current.temporalDistortion = THREE.MathUtils.lerp(crystalMaterialProps.temporalDistortion, 0.4, ease);
            sphereMatRef.current.roughness = THREE.MathUtils.lerp(crystalMaterialProps.roughness, 0.05, ease);
        }
        
        if (textGroupRef.current) {
             textGroupRef.current.position.set(textStartX, 0, 0);
             const textScale = THREE.MathUtils.lerp(1, 0, Math.pow(ease, 2));
             textGroupRef.current.scale.setScalar(textScale);
             textGroupRef.current.rotation.y = -ease * Math.PI;
             textGroupRef.current.position.z = THREE.MathUtils.lerp(0, -1, ease);
             textGroupRef.current.rotation.x = Math.sin(time * 0.5) * 0.05 * (1 - ease);
        }
    });

    return (
        <group>
            <MovingLight />
            <Float 
                speed={1.5} 
                rotationIntensity={isMobile ? 0.05 : 0.1} 
                floatIntensity={isMobile ? 0.1 : 0.2} 
                floatingRange={[-0.1, 0.1]}
            >
                {/* The Sphere - Optimized Geometry */}
                <mesh ref={sphereRef} position={[sphereStartX, sphereStartY, 0]}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <MeshTransmissionMaterial 
                        ref={sphereMatRef} 
                        {...crystalMaterialProps}
                    />
                </mesh>

                {/* The Text - Optimized Geometry */}
                <group ref={textGroupRef} position={[textStartX, 0, 0]}>
                    <spotLight position={[0, 2, 5]} intensity={30} color="#ffffff" angle={0.6} penumbra={0.5} distance={10} />
                    <spotLight position={[5, 0, -5]} intensity={40} color="#a0e0ff" angle={0.8} penumbra={1} distance={10} />
                    
                    <Center>
                        <Text3D 
                            font={fontUrl} 
                            size={textSize} 
                            height={0.2} 
                            curveSegments={12}
                            bevelEnabled
                            bevelThickness={0.04} 
                            bevelSize={0.015}
                            bevelOffset={0}
                            bevelSegments={3}
                            letterSpacing={-0.03}
                        >
                            FOUND
                            <MeshTransmissionMaterial
                                backside
                                {...crystalMaterialProps}
                                thickness={0.8} 
                            />
                        </Text3D>
                    </Center>
                </group>
            </Float>
        </group>
    );
};

const PrismaticArtifact = () => {
    const groupRef = useRef<THREE.Group>(null);
    const { height, width } = useThree((state) => state.viewport);
    const isMobile = width < 5;

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
        }
    });

    return (
        <group position={[isMobile ? 0 : -2.5, -height * 2, 0]} ref={groupRef}>
            <mesh scale={isMobile ? 1.8 : 2.2}>
                <icosahedronGeometry args={[1, 0]} />
                <MeshTransmissionMaterial 
                    backside
                    samples={3} // Optimized
                    thickness={0.5}
                    chromaticAberration={1}
                    anisotropy={0.2} // Optimized
                    distortion={0.5}
                    iridescence={1}
                    roughness={0.1}
                    color="#e0e0ff"
                />
            </mesh>
        </group>
    );
};

const KineticGrid = () => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const { height, width } = useThree((state) => state.viewport);
    const scroll = useScroll();
    const isMobile = width < 5;

    const count = isMobile ? 10 : 16;
    const total = count * count;
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const color = useMemo(() => new THREE.Color(), []);

    useFrame((state) => {
        if (!meshRef.current) return;
        
        const time = state.clock.elapsedTime;
        const transition = scroll?.curve(3 / 5, 1.2 / 5) || 0;

        let i = 0;
        for (let x = 0; x < count; x++) {
            for (let z = 0; z < count; z++) {
                const sep = isMobile ? 0.4 : 0.5;
                const xPos = (x - count / 2) * sep;
                const zPos = (z - count / 2) * sep;
                const dist = Math.sqrt(xPos * xPos + zPos * zPos);
                
                const yPos = Math.sin(dist * 2 - time * 2) * 0.5;
                
                dummy.position.set(xPos, yPos, zPos);
                dummy.rotation.set(Math.sin(x/4 + time) + yPos, 0, Math.cos(z/4 + time) + yPos);
                
                const finalScale = ((Math.sin(x + z + time) * 0.5 + 0.5) * 0.8 + 0.2) * transition;
                dummy.scale.set(finalScale, finalScale, finalScale);
                
                dummy.updateMatrix();
                meshRef.current.setMatrixAt(i, dummy.matrix);
                
                color.setHSL(0.9 + ((Math.sin(dist * 3 - time) + 1) / 2) * 0.15, 1, 0.5);
                meshRef.current.setColorAt(i, color);
                i++;
            }
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <group position={[isMobile ? 0 : 2.5, -height * 3, 0]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
            <instancedMesh ref={meshRef} args={[undefined, undefined, total]}>
                <boxGeometry args={[0.2, 0.2, 0.2]} />
                <meshStandardMaterial roughness={0.2} metalness={0.8} />
            </instancedMesh>
        </group>
    );
};

const Singularity = () => {
    const blackHoleRef = useRef<THREE.Mesh>(null);
    const { height, width } = useThree((state) => state.viewport);
    const isMobile = width < 5;
    const particleCount = isMobile ? 2000 : 3500; // Optimized
    
    const { positions, colors } = useMemo(() => {
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const color1 = new THREE.Color('#ff3300');
        const color2 = new THREE.Color('#ffffff');

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 2 + Math.random() * 5;
            const spiralOffset = angle * 0.5;
            
            positions[i * 3] = Math.cos(angle + spiralOffset) * radius;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 0.2 * (5/radius);
            positions[i * 3 + 2] = Math.sin(angle + spiralOffset) * radius;

            const mixedColor = color1.clone().lerp(color2, 2 / radius);
            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }
        return { positions, colors };
    }, [particleCount]);

    useFrame((state) => {
        if (blackHoleRef.current) {
            // @ts-ignore
            blackHoleRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return (
        <group position={[0, -height * 4, 0]}>
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
                    <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
                </bufferGeometry>
                <pointsMaterial size={0.03} vertexColors transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
            </points>
            <mesh ref={blackHoleRef}>
                <sphereGeometry args={[1.8, 32, 32]} /> {/* Reduced segments */}
                {/* @ts-ignore */}
                <blackHoleMaterial transparent />
            </mesh>
        </group>
    );
};

const CameraRig = () => {
    const scroll = useScroll();
    const { height } = useThree((state) => state.viewport);

    useFrame((state) => {
        const offset = scroll.offset;
        const targetY = -offset * (scroll.pages - 1) * height;
        
        state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.08);

        // Shake effect near Singularity
        if (offset > 0.75 && offset < 0.9) {
            state.camera.position.x += (Math.random() - 0.5) * 0.02;
            state.camera.position.z += (Math.random() - 0.5) * 0.02;
        } else {
             state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, 0, 0.1);
        }
    });
    return null;
}

// --- Exported Scenes ---

export const HomeScene = ({ onNavigate }: { onNavigate?: (view: ViewState) => void }) => {
    const { height, width } = useThree((state) => state.viewport);
    const isMobile = width < 5;

    return (
        <ScrollControls pages={6} damping={0.2}>
            <CameraRig />
            
            {/* Hero Composition: .FOUND */}
            <HeroComposition />
            <Sparkles count={50} scale={10} size={4} speed={0.4} opacity={0.5} color="#ffffff" />

            {/* Distorted Image Section */}
            <group position={[0, -height * 1, 0]}>
                 <DistortedImage 
                    position={[0, 0, -2]} 
                    imgSrc="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    scale={isMobile ? [2.5, 3.5, 1] : [3, 4, 1]}
                 />
            </group>

            {/* Prismatic Artifact */}
            <PrismaticArtifact />

            {/* Kinetic Grid */}
            <KineticGrid />

            {/* Singularity */}
            <Singularity />

            <Scroll html style={{ width: '100%', height: '100%' }}>
                <Overlay onNavigate={onNavigate} />
            </Scroll>
        </ScrollControls>
    );
};

export const AmbientScene = () => {
    useFrame((state) => {
        // Gentle camera drift
        state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.5;
        state.camera.position.y = Math.cos(state.clock.elapsedTime * 0.1) * 0.5;
        state.camera.lookAt(0, 0, 0);
    });

    return (
        <group>
             <Sparkles count={200} scale={15} size={2} speed={0.2} opacity={0.3} color="#44aaff" />
             <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
                <points>
                    <sphereGeometry args={[4, 32, 32]} />
                    <pointsMaterial size={0.015} color="#333333" transparent opacity={0.5} />
                </points>
             </Float>
        </group>
    );
};

export const SceneWrapper = ({ mode, onNavigate }: { mode: 'HOME' | 'AMBIENT', onNavigate?: (view: ViewState) => void }) => {
    return (
        <>
            <color attach="background" args={['#050505']} />
            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} intensity={1} />
            
            {mode === 'HOME' ? <HomeScene onNavigate={onNavigate} /> : <AmbientScene />}
        </>
    );
};
