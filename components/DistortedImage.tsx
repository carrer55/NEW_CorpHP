import React, { useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { useTexture, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Define the custom shader material
const ImageDistortMaterial = shaderMaterial(
  {
    uTexture: null,
    uHover: 0,
    uTime: 0,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    uniform float uHover;
    uniform float uTime;

    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Subtle wave effect on hover
      float wave = sin(pos.x * 5.0 + uTime * 2.0) * 0.1 * uHover;
      pos.z += wave;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform sampler2D uTexture;
    uniform float uHover;
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      
      // Distortion logic
      float noise = sin(uv.y * 20.0 + uTime) * 0.02 * uHover;
      uv.x += noise;
      
      // RGB Shift
      float shift = 0.02 * uHover;
      float r = texture2D(uTexture, uv + vec2(shift, 0.0)).r;
      float g = texture2D(uTexture, uv).g;
      float b = texture2D(uTexture, uv - vec2(shift, 0.0)).b;
      
      vec3 color = vec3(r, g, b);
      
      // Grayscale to Color transition
      vec3 gray = vec3(dot(color, vec3(0.299, 0.587, 0.114)));
      vec3 finalColor = mix(gray, color, uHover + 0.2); // Always slight color, full on hover
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

extend({ ImageDistortMaterial });

interface DistortedImageProps {
    position: [number, number, number];
    imgSrc: string;
    scale?: [number, number, number];
}

export const DistortedImage: React.FC<DistortedImageProps> = ({ position, imgSrc, scale = [3, 4, 1] }) => {
    const ref = useRef({ hovered: false });
    const materialRef = useRef<any>(null);
    
    // Load texture
    const texture = useTexture(imgSrc);
    // @ts-ignore
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

    useFrame((state, delta) => {
        if (materialRef.current) {
            materialRef.current.uTime += delta;
            // Smooth lerp for hover effect
            materialRef.current.uHover = THREE.MathUtils.lerp(
                materialRef.current.uHover,
                ref.current.hovered ? 1 : 0,
                0.1
            );
        }
    });

    return (
        <group position={position}>
            <mesh 
                scale={scale as any}
                onPointerOver={() => (ref.current.hovered = true)}
                onPointerOut={() => (ref.current.hovered = false)}
            >
                <planeGeometry args={[1, 1, 32, 32]} />
                {/* @ts-ignore */}
                <imageDistortMaterial ref={materialRef} uTexture={texture} transparent />
            </mesh>
        </group>
    );
};