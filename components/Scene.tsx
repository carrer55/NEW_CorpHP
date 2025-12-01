import React, { useRef, useMemo, useEffect } from 'react';
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
    const threeState = useThree(); // To access size (canvas pixel size) and camera
    
    // Increased threshold to better catch vertical mobile layouts/tablets
    const isMobile = width < 6.0; 
    
    // Font URL for 3D Text
    const fontUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_bold.typeface.json';

    // Colors
    const initialColor = useMemo(() => new THREE.Color('#eef2ff'), []); 
    const targetColor = useMemo(() => new THREE.Color('#ffffff'), []);

    // --- Responsive Configuration ---
    
    // Size: Bigger sphere on mobile to look like a planet
    const sphereStartScale = isMobile ? 0.45 : 0.20; 
    
    // Text Size: Adjusted to ensure it fits on screen without cutoff
    // Mobile: Scale relative to width to fill the screen (approx 0.18 factor for 5 chars)
    const textSize = isMobile ? width * 0.18 : 0.9;
    
    // --- Layout Calculations ---
    
    // Desktop: Horizontal Layout
    const desktopSphereRadius = 0.20;
    const desktopTextApproxWidth = 0.9 * 4.2;
    const desktopGap = 0.5;
    const desktopTotalWidth = (desktopSphereRadius * 2) + desktopGap + desktopTextApproxWidth;
    
    const desktopGroupStartX = -desktopTotalWidth / 2;
    const desktopSphereStartX = desktopGroupStartX + desktopSphereRadius;
    const desktopTextStartX = desktopGroupStartX + (desktopSphereRadius * 2) + desktopGap + (desktopTextApproxWidth / 2);
    
    // Mobile: Vertical Layout (Sphere Top, Text Bottom)
    // Lowered to 0.7 to move elements down on screen
    const mobileSphereStartY = 0.7; 
    // Calculate Text Position based on Sphere
    // Gap 0.4 maintained
    const mobileTextY = mobileSphereStartY - 0.45 - 0.4; 
    
    // Unified Crystal Material Settings (Performance Optimized)
    const crystalMaterialProps = {
        samples: isMobile ? 3 : 5, 
        resolution: isMobile ? 256 : 512,
        thickness: isMobile ? 1.0 : 1.5,
        chromaticAberration: 1.0, 
        anisotropy: 0.1, 
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
            if (isMobile) {
                // Mobile Animation: "Swallow & Converge"
                
                // Phase 1: Growth & Descent to Text (0.0 -> 0.15)
                // Starts immediately, hits the text position quickly
                const phase1 = scroll.range(0, 0.15);
                
                // Phase 2: Converge into Arrow (0.15 -> 0.30)
                // Sucks down into the scroll arrow
                const phase2 = scroll.range(0.15, 0.15);
                
                const startY = mobileSphereStartY;
                const textY = mobileTextY;
                // Target the "SCROLL" arrow position (approx bottom of screen)
                // -height/2 is bottom edge. +0.5 puts it roughly at the arrow icon position.
                const arrowY = -height / 2 + 0.5;

                const startScale = sphereStartScale;
                const maxScale = 2.5; // Large size when at text
                const endScale = 0.0; // Disappear into arrow

                let targetY, targetScale, targetZ;

                if (phase2 > 0) {
                    // Phase 2: Text Position -> Arrow Position (Suction)
                    const p2Ease = Math.pow(phase2, 2); // Accelerate into the arrow
                    targetY = THREE.MathUtils.lerp(textY, arrowY, p2Ease);
                    targetScale = THREE.MathUtils.lerp(maxScale, endScale, p2Ease);
                    targetZ = THREE.MathUtils.lerp(2.0, 0, p2Ease); // Move back to screen plane
                } else {
                    // Phase 1: Start -> Text Position (Growth)
                    const p1Ease = THREE.MathUtils.smoothstep(phase1, 0, 1);
                    targetY = THREE.MathUtils.lerp(startY, textY, p1Ease);
                    targetScale = THREE.MathUtils.lerp(startScale, maxScale, p1Ease);
                    targetZ = THREE.MathUtils.lerp(0, 2.0, p1Ease); // Pop out towards camera
                }
                
                sphereRef.current.position.set(0, targetY, targetZ);
                sphereRef.current.scale.setScalar(targetScale);

            } else {
                // Desktop Animation: Move Sphere towards the Text horizontally
                const currentX = THREE.MathUtils.lerp(desktopSphereStartX, desktopTextStartX, ease);
                const currentY = THREE.MathUtils.lerp(-0.3, 0, aggressiveEase);
                const currentZ = THREE.MathUtils.lerp(0, 0.5, aggressiveEase);
                sphereRef.current.position.set(currentX, currentY, currentZ);

                // Scale
                const targetScale = 2.5; 
                const currentScale = THREE.MathUtils.lerp(sphereStartScale, targetScale, aggressiveEase);
                sphereRef.current.scale.setScalar(currentScale);
            }

            // Rotation
            sphereRef.current.rotation.x = time * 0.3 + ease * Math.PI;
            sphereRef.current.rotation.y = time * 0.4 + ease * Math.PI * 2;
            sphereRef.current.rotation.z = ease * Math.PI * 0.5; 
        }
        
        // Material Metamorphosis
        if (sphereMatRef.current) {
            sphereMatRef.current.color.lerpColors(initialColor, targetColor, ease);
            sphereMatRef.current.distortion = THREE.MathUtils.lerp(crystalMaterialProps.distortion, 0.6, ease);
            sphereMatRef.current.temporalDistortion = THREE.MathUtils.lerp(crystalMaterialProps.temporalDistortion, 0.4, ease);
            sphereMatRef.current.roughness = THREE.MathUtils.lerp(crystalMaterialProps.roughness, 0.05, ease);
        }
        
        if (textGroupRef.current) {
             if (isMobile) {
                 // Mobile: Fixed World Position
                 textGroupRef.current.position.set(0, mobileTextY, 0);
                 
                 // Text gets "swallowed" exactly when sphere reaches max size (Phase 2 start)
                 const swallowProgress = THREE.MathUtils.smoothstep(scroll.range(0.12, 0.08), 0, 1);
                 
                 // Scale factor: Base scale * (1 - swallow)
                 textGroupRef.current.scale.setScalar(1 - swallowProgress); 
                 textGroupRef.current.rotation.set(0, 0, 0);

             } else {
                 // Desktop: Text animation (Collapse/Disappear)
                 textGroupRef.current.position.set(desktopTextStartX, 0, 0);
                 const textScale = THREE.MathUtils.lerp(1, 0, Math.pow(ease, 2));
                 textGroupRef.current.scale.setScalar(textScale);
                 textGroupRef.current.rotation.y = -ease * Math.PI;
                 textGroupRef.current.position.z = THREE.MathUtils.lerp(0, -1, ease);
                 textGroupRef.current.rotation.x = Math.sin(time * 0.5) * 0.05 * (1 - ease);
             }
        }
    });

    return (
        <group>
            <MovingLight />
            <Float 
                speed={1.5} 
                rotationIntensity={isMobile ? 0.02 : 0.1} // Reduced rotation on mobile for readability
                floatIntensity={isMobile ? 0.05 : 0.2} // Reduced float on mobile
                floatingRange={[-0.05, 0.05]}
            >
                {/* The Sphere */}
                <mesh 
                    ref={sphereRef} 
                    position={isMobile ? [0, mobileSphereStartY, 0] : [desktopSphereStartX, -0.3, 0]}
                    // Render order important for transparency
                >
                    <sphereGeometry args={[1, 32, 32]} />
                    <MeshTransmissionMaterial 
                        ref={sphereMatRef} 
                        {...crystalMaterialProps}
                    />
                </mesh>

                {/* The Text */}
                <group 
                    ref={textGroupRef} 
                    // Initial position
                    position={isMobile ? [0, mobileTextY, 0] : [desktopTextStartX, 0, 0]}
                >
                    <spotLight position={[0, 2, 5]} intensity={30} color="#ffffff" angle={0.6} penumbra={0.5} distance={10} />
                    <spotLight position={[5, 0, -5]} intensity={40} color="#a0e0ff" angle={0.8} penumbra={1} distance={10} />
                    
                    <Center>
                        <Text3D 
                            font={fontUrl} 
                            size={textSize} 
                            height={isMobile ? 0.05 : 0.2} 
                            curveSegments={12}
                            bevelEnabled
                            bevelThickness={isMobile ? 0.01 : 0.04} 
                            bevelSize={isMobile ? 0.005 : 0.015}
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
    const isMobile = width < 6.0;

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
        }
    });

    return (
        <group position={[isMobile ? 0 : -2.5, -height * 2, 0]} ref={groupRef}>
            <mesh scale={isMobile ? 1.5 : 2.2}>
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
    const isMobile = width < 6.0;

    const count = isMobile ? 8 : 16; // Reduce count for mobile performance
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
                const sep = isMobile ? 0.6 : 0.5;
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
    const isMobile = width < 6.0;
    const particleCount = isMobile ? 1500 : 3500; // Further optimized for mobile
    
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
             // Force center X strongly to avoid drifting on mobile resize
             state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, 0, 0.1);
        }
    });
    return null;
}

// --- Scroll Snap Helper ---
const ScrollSnapHandler = () => {
    const scroll = useScroll();
    const { width } = useThree((state) => state.viewport);
    const isMobile = width < 6.0;

    useEffect(() => {
        if (scroll.el && isMobile) {
            // Enforce scroll snapping on mobile
            scroll.el.style.scrollSnapType = 'y mandatory';
            // Optional: scrollBehavior smooth can conflict with damping, so we rely on CSS snap.
            // R3F ScrollControls usually creates a div with overflow-y: auto.
        } else if (scroll.el) {
            scroll.el.style.scrollSnapType = '';
        }
    }, [scroll.el, isMobile]);

    return null;
}

// --- Exported Scenes ---

export const HomeScene = ({ onNavigate }: { onNavigate?: (view: ViewState) => void }) => {
    const { height, width } = useThree((state) => state.viewport);
    const isMobile = width < 6.0;

    return (
        <ScrollControls pages={6} damping={0.2}>
            <ScrollSnapHandler />
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