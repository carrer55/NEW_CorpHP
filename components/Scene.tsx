import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
import { useScroll, Environment, Float, Sparkles, MeshTransmissionMaterial, shaderMaterial, ScrollControls, Scroll, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';
import { DistortedImage } from './DistortedImage';
import { Overlay } from './Overlay';
import { ViewState } from '../types';

// --- Global Spacing Configuration ---
const SECTION_SPACING = 1.5; // 1.0 = adjacent, 1.5 = 50vh gap
// Explicit positions for variable spacing
const POS_PRODUCTS = -1.0 * SECTION_SPACING; // Page 1ish
const POS_PHILOSOPHY = POS_PRODUCTS - 2.3; // Wider gap
const POS_VISION = POS_PHILOSOPHY - 1.5;
const POS_DOT = POS_VISION - 1.1; // Narrower gap
const POS_FOOTER = POS_DOT - 1.0;

// Total height based on the last element position
// We add 1.0 for the footer itself.
// POS_FOOTER is approx -6.4. So total pages needs to cover roughly 7.5 height units.
// Let's calibrate: 0 (Hero) + 1.5 + 2.3 + 1.5 + 1.1 + 1.0 = 7.4
const TOTAL_PAGES = 8.5; 

// --- Custom Shaders and Components (Reused) ---

export const BlackHoleMaterial = shaderMaterial(
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
    const textMatRef = useRef<any>(null); // Ref for Text Material
    const scroll = useScroll();
    const { width, height } = useThree((state) => state.viewport);
    const { mouse } = useThree(); // Get mouse position for interaction
    
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
    
    // Mobile: Vertical Layout
    const mobileSphereStartY = 0.7; 
    const mobileTextY = mobileSphereStartY - 0.45 - 0.4; 
    
    // Unified Crystal Material Settings (Performance Optimized)
    const crystalMaterialProps = {
        samples: isMobile ? 4 : 8, // Increased mobile samples slightly for better quality
        resolution: isMobile ? 512 : 1024, // Increased mobile resolution
        thickness: 1.5, // Unified thickness (was 1.0 on mobile)
        chromaticAberration: 1.0, 
        anisotropy: 0.3, 
        distortion: 0.4, 
        distortionScale: 0.5,
        temporalDistortion: 0.2, 
        iridescence: 1,
        iridescenceIOR: 1.2,
        iridescenceThicknessRange: [0, 1400] as [number, number],
        roughness: 0.0, // Unified roughness (glassy)
        color: "#eef2ff",
        background: new THREE.Color('#000000'),
        toneMapped: false,
    };
    
    useFrame((state) => {
        // Adjust animation ranges for increased scroll distance
        const scaledRangeLimit = 0.25 * (6 / TOTAL_PAGES); 
        const range = scroll.range(0, scaledRangeLimit);
        const ease = THREE.MathUtils.smoothstep(range, 0, 1);
        const aggressiveEase = Math.pow(ease, 3);
        const time = state.clock.elapsedTime;
        
        // --- Sphere Animation ---
        if (sphereRef.current) {
            if (isMobile) {
                // Mobile Animation logic (Swallow) - Kept same
                const p1End = 0.15 * (6 / TOTAL_PAGES);
                const p2Start = 0.15 * (6 / TOTAL_PAGES);
                const phase1 = scroll.range(0, p1End);
                const phase2 = scroll.range(p2Start, 0.15 * (6 / TOTAL_PAGES));
                
                const startY = mobileSphereStartY;
                const textY = mobileTextY;
                const arrowY = -height / 2 + 0.5;

                const startScale = sphereStartScale;
                const maxScale = 2.5; 
                const endScale = 0.0; 

                let targetY, targetScale, targetZ;

                if (phase2 > 0) {
                    const p2Ease = Math.pow(phase2, 2); 
                    targetY = THREE.MathUtils.lerp(textY, arrowY, p2Ease);
                    targetScale = THREE.MathUtils.lerp(maxScale, endScale, p2Ease);
                    targetZ = THREE.MathUtils.lerp(2.0, 0, p2Ease); 
                } else {
                    const p1Ease = THREE.MathUtils.smoothstep(phase1, 0, 1);
                    targetY = THREE.MathUtils.lerp(startY, textY, p1Ease);
                    targetScale = THREE.MathUtils.lerp(startScale, maxScale, p1Ease);
                    targetZ = THREE.MathUtils.lerp(0, 2.0, p1Ease); 
                }
                
                sphereRef.current.position.set(0, targetY, targetZ);
                sphereRef.current.scale.setScalar(targetScale);
                
                // Continuous Rotation (Mobile)
                sphereRef.current.rotation.x = time * 0.3 + ease * Math.PI;
                sphereRef.current.rotation.y = time * 0.4 + ease * Math.PI * 2;
                sphereRef.current.rotation.z = ease * Math.PI * 0.5;

            } else {
                // ** Desktop: Innovative Liquid Absorption Animation **
                
                // Define specific scroll range for the absorption event
                // It starts immediately (0) and happens fast (0.15 relative to page 1)
                const absorptionProgress = scroll.range(0, 1.5 / TOTAL_PAGES);
                const absorbEase = THREE.MathUtils.smoothstep(absorptionProgress, 0, 1);
                const absorbAggressive = Math.pow(absorbEase, 3); // Faster end

                // 1. Sphere Position: Stays relatively stable but floats
                const currentY = THREE.MathUtils.lerp(-0.3, 0, absorbEase);
                const currentZ = THREE.MathUtils.lerp(0, 0.5, absorbEase);

                // Idle Floating
                const floatY = Math.sin(time * 0.45) * 0.08 + Math.cos(time * 0.25) * 0.04;
                const floatX = Math.cos(time * 0.35) * 0.04;

                // Mouse Parallax (Reduced during absorption to keep focus)
                const mouseInfluence = THREE.MathUtils.lerp(0.2, 0.05, absorbEase);
                const parallaxX = mouse.x * mouseInfluence * 0.2;
                const parallaxY = mouse.y * mouseInfluence * 0.2;

                sphereRef.current.position.set(
                    desktopSphereStartX + floatX + parallaxX, 
                    currentY + floatY + parallaxY, 
                    currentZ
                );

                // 2. Sphere Growth (Absorbing Energy)
                // Stays small for a split second, then grows as text enters
                const targetScale = 2.5; 
                // Delay growth slightly to match text impact
                const growthCurve = THREE.MathUtils.smoothstep(absorptionProgress, 0.1, 0.9);
                const currentScale = THREE.MathUtils.lerp(sphereStartScale, targetScale, growthCurve);
                sphereRef.current.scale.setScalar(currentScale);

                // 3. Sphere Rotation
                const baseRotX = time * 0.2 + absorbEase * Math.PI;
                const baseRotY = time * 0.3 + absorbEase * Math.PI * 2;
                sphereRef.current.rotation.x = baseRotX;
                sphereRef.current.rotation.y = baseRotY;

                // 4. Sphere Material Reaction (The "Impact")
                if (sphereMatRef.current) {
                    sphereMatRef.current.color.lerpColors(initialColor, targetColor, absorbEase);
                    
                    // Fluid/Living Glass Effect
                    const pulse = (Math.sin(time * 1.1) + 1) * 0.5; 
                    
                    // EXPLOSIVE Reaction during absorption
                    // Distortion peaks when text hits (approx scroll 0.1-0.3)
                    const impactDistortion = Math.sin(absorbEase * Math.PI) * 2.0; 
                    
                    // Intense Chromatic Aberration (Rainbows)
                    sphereMatRef.current.chromaticAberration = 1.2 + pulse * 1.5 + impactDistortion * 3.0; 
                    
                    // Breathing Distortion
                    const baseDistortion = THREE.MathUtils.lerp(crystalMaterialProps.distortion, 0.8, absorbEase);
                    sphereMatRef.current.distortion = baseDistortion + pulse * 0.4 + impactDistortion;
                    
                    // Breathing Thickness
                    sphereMatRef.current.thickness = 1.2 + Math.cos(time * 0.7) * 0.5;
                }

                // --- Text Behavior (The Victim) ---
                if (textGroupRef.current) {
                    // 1. Move into the Sphere
                    const textStartPos = desktopTextStartX;
                    const textEndPos = desktopSphereStartX; // Target the sphere center
                    
                    // Non-linear move: starts slow, accelerates into the sphere
                    const moveEase = Math.pow(absorbEase, 2);
                    
                    // 2. Scale (Sucked in)
                    // Stays visible for a bit, then shrinks rapidly to 0
                    const scaleEase = Math.pow(absorbEase, 4); // Very late shrink
                    const currentTextScale = THREE.MathUtils.lerp(1, 0, scaleEase);

                    // 3. Floating (Dampened by scroll)
                    const floatDampen = 1.0 - absorbEase;
                    const tFloatY = (Math.sin(time * 0.5) * 0.1) * floatDampen;
                    const tFloatX = (Math.cos(time * 0.4) * 0.05) * floatDampen;
                    
                    // 4. Position Update
                    textGroupRef.current.position.set(
                        THREE.MathUtils.lerp(textStartPos, textEndPos, moveEase) + tFloatX,
                        tFloatY,
                        THREE.MathUtils.lerp(0, -2, absorbEase) // Move slightly back into sphere
                    );
                    
                    textGroupRef.current.scale.setScalar(currentTextScale);
                    
                    // 5. Rotation (Spin into the hole)
                    // Rotate towards sphere center
                    textGroupRef.current.rotation.y = THREE.MathUtils.lerp(0, Math.PI, moveEase);
                    textGroupRef.current.rotation.z = THREE.MathUtils.lerp(0, -Math.PI / 4, moveEase);

                    // 6. Text Material (Liquify)
                    if (textMatRef.current) {
                        // As it moves, it becomes more liquid/distorted
                        textMatRef.current.distortion = THREE.MathUtils.lerp(0.4, 4.0, moveEase);
                        textMatRef.current.thickness = THREE.MathUtils.lerp(1.5, 0.0, moveEase);
                        textMatRef.current.chromaticAberration = THREE.MathUtils.lerp(1.0, 5.0, moveEase);
                        // Fade out opacity/transmission density
                        textMatRef.current.opacity = THREE.MathUtils.lerp(1.0, 0.0, moveEase);
                    }
                }
            }
        } else if (sphereRef.current && isMobile) {
            // Fallback for mobile frame skip safety (though covered above)
             sphereMatRef.current.distortion = THREE.MathUtils.lerp(crystalMaterialProps.distortion, 0.6, ease);
        }
    });

    return (
        <group>
            <MovingLight />
            {/* Reduced float intensity since we handle manual floating logic in frame loop for Desktop */}
            <Float 
                speed={isMobile ? 1.5 : 0} 
                rotationIntensity={isMobile ? 0.02 : 0} 
                floatIntensity={isMobile ? 0.05 : 0} 
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
                    {/* Dynamic Lighting for both Mobile and Desktop to ensure consistent design */}
                    <pointLight position={[-2, 1, 2]} intensity={isMobile ? 8 : 10} color="#ffaaee" distance={5} />
                    <pointLight position={[2, -1, 1]} intensity={isMobile ? 8 : 10} color="#aaddff" distance={5} />
                    
                    <Center>
                        <Text3D 
                            font={fontUrl} 
                            size={textSize} 
                            height={isMobile ? 0.3 : 0.4} // Thicker on mobile to match desktop design
                            curveSegments={isMobile ? 16 : 24} // Smoother
                            bevelEnabled
                            bevelThickness={isMobile ? 0.03 : 0.05} 
                            bevelSize={isMobile ? 0.01 : 0.02}
                            bevelOffset={0}
                            bevelSegments={isMobile ? 4 : 5}
                            letterSpacing={-0.03}
                        >
                            FOUND
                            <MeshTransmissionMaterial
                                ref={textMatRef}
                                backside
                                {...crystalMaterialProps}
                                samples={isMobile ? 4 : 10} 
                                resolution={isMobile ? 512 : 1024}
                                thickness={1.5}
                                roughness={0.0}
                                anisotropy={0.5}
                            />
                        </Text3D>
                    </Center>
                </group>
            </Float>
        </group>
    );
};

// Exporting to be reusable in MobileSwipeScroll
export const PrismaticArtifact = () => {
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
        // Raised Y position significantly to align with start of section text
        // Was +2.2, now +3.5 to move it up.
        // For mobile reuse, we might need to adjust position via props, but sticking to logic:
        <group position={[isMobile ? 0 : -2.5, isMobile ? 0 : POS_PHILOSOPHY * height + 3.5, 0]} ref={groupRef}>
            <mesh scale={isMobile ? 1.5 : 2.2}>
                <icosahedronGeometry args={[1, 0]} />
                <MeshTransmissionMaterial 
                    backside
                    samples={3} 
                    thickness={0.5}
                    chromaticAberration={1}
                    anisotropy={0.2} 
                    distortion={0.5}
                    iridescence={1}
                    roughness={0.1}
                    color="#e0e0ff"
                />
            </mesh>
        </group>
    );
};

export const KineticGrid = () => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const { height, width } = useThree((state) => state.viewport);
    const scroll = useScroll();
    const isMobile = width < 6.0;

    const count = isMobile ? 8 : 16; 
    const total = count * count;
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const color = useMemo(() => new THREE.Color(), []);

    useFrame((state) => {
        if (!meshRef.current) return;
        
        const time = state.clock.elapsedTime;
        
        // --- UPDATED VISIBILITY LOGIC ---
        // Range: From before Vision text (allows entry animation) through to Dot section
        // POS_VISION is approx -5.3. POS_DOT is approx -6.4.
        const visionPagePos = Math.abs(POS_VISION);
        
        // Start animation 1.5 units before Vision center so it is fully built/active when text arrives
        const startPage = Math.max(0, visionPagePos - 1.5);
        
        // Duration: Distance to Dot + extra buffer to keep it alive until Dot fully takes over
        // Wide duration (3.5 units) covers the entry, the text reading phase, and the transition to the next section
        const durationPages = 3.5; 
        
        const startOffset = startPage / (TOTAL_PAGES - 1);
        const duration = durationPages / (TOTAL_PAGES - 1);
        
        const transition = scroll?.curve(startOffset, duration) || 0;
        // --------------------------------

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
        // Raised Y position to align with start of VISION section
        // Was +0, now +2.5 to move it up
        <group position={[isMobile ? 0 : 2.5, POS_VISION * height + 2.5, 0]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
            <instancedMesh ref={meshRef} args={[undefined, undefined, total]}>
                <boxGeometry args={[0.2, 0.2, 0.2]} />
                <meshStandardMaterial roughness={0.2} metalness={0.8} />
            </instancedMesh>
        </group>
    );
};

// Exporting to be reusable
export const Singularity = ({ colorStart = '#ff3300', colorEnd = '#000000', scale = 1.0 }: { colorStart?: string, colorEnd?: string, scale?: number }) => {
    const blackHoleRef = useRef<THREE.Mesh>(null);
    const { height, width } = useThree((state) => state.viewport);
    const isMobile = width < 6.0;
    const particleCount = isMobile ? 1500 : 3500; 
    
    // Allow color override via props or default
    const cStart = useMemo(() => new THREE.Color(colorStart), [colorStart]);
    const cEnd = useMemo(() => new THREE.Color(colorEnd), [colorEnd]);

    const { positions, colors } = useMemo(() => {
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        // White particles for singularity feel
        const pColor = new THREE.Color('#ffffff'); 

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 2 + Math.random() * 5;
            const spiralOffset = angle * 0.5;
            
            positions[i * 3] = Math.cos(angle + spiralOffset) * radius;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 0.2 * (5/radius);
            positions[i * 3 + 2] = Math.sin(angle + spiralOffset) * radius;

            colors[i * 3] = pColor.r;
            colors[i * 3 + 1] = pColor.g;
            colors[i * 3 + 2] = pColor.b;
        }
        return { positions, colors };
    }, [particleCount]);

    useFrame((state) => {
        if (blackHoleRef.current) {
            // @ts-ignore
            blackHoleRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
            // @ts-ignore
            blackHoleRef.current.material.uniforms.uColorStart.value = cStart;
             // @ts-ignore
            blackHoleRef.current.material.uniforms.uColorEnd.value = cEnd;
        }
    });

    return (
        // Raised position to align with start of .The DOT section
        // Was +2.5, now +1.5 to lower it slightly from the very top
        // If reusing in mobile scene (where 0,0,0 is center), we check parent scroll or just default
        <group position={[0, isMobile ? 0 : POS_DOT * height + 1.5, 0]} scale={scale}>
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
                    <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
                </bufferGeometry>
                <pointsMaterial size={0.03} vertexColors transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
            </points>
            <mesh ref={blackHoleRef}>
                <sphereGeometry args={[1.8, 32, 32]} /> 
                {/* @ts-ignore */}
                <blackHoleMaterial transparent />
            </mesh>
        </group>
    );
};

const CameraRig = () => {
    const scroll = useScroll();
    const { height, width } = useThree((state) => state.viewport);
    const isMobile = width < 6.0;

    useFrame((state) => {
        const offset = scroll.offset;
        const targetY = -offset * (scroll.pages - 1) * height;
        
        // Faster lerp on mobile for swipe responsiveness
        const lerpSpeed = isMobile ? 0.2 : 0.08;
        state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, lerpSpeed);

        // Shake effect near Singularity
        // Calculate progress for POS_DOT
        const singularityProgress = Math.abs(POS_DOT) / (TOTAL_PAGES - 1);
        const singularityRange = 0.5 / TOTAL_PAGES;

        if (offset > singularityProgress - singularityRange && offset < singularityProgress + singularityRange) {
            state.camera.position.x += (Math.random() - 0.5) * 0.02;
            state.camera.position.z += (Math.random() - 0.5) * 0.02;
        } else {
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
            // scroll.el.style.scrollSnapType = 'y mandatory';
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
        <ScrollControls pages={TOTAL_PAGES} damping={isMobile ? 0 : 0.2}>
            <ScrollSnapHandler />
            <CameraRig />
            
            {/* Hero Composition: .FOUND */}
            <HeroComposition />
            <Sparkles count={50} scale={10} size={4} speed={0.4} opacity={0.5} color="#ffffff" />

            {/* Distorted Image Section */}
            <group position={[0, POS_PRODUCTS * height, 0]}>
                 <DistortedImage 
                    position={[0, 0, -2]} 
                    imgSrc="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    // Reduced scale on mobile to prevent overlap with Screen 3
                    scale={isMobile ? [2.5, 3.5 * 0.8, 1] : [3, 4, 1]}
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