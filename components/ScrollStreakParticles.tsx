import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

interface ScrollStreakParticlesProps {
  count?: number;
  scale?: [number, number, number];
  position?: [number, number, number];
  color?: string;
  size?: number;
  opacity?: number;
}

export const ScrollStreakParticles: React.FC<ScrollStreakParticlesProps> = ({
  count = 300,
  scale = [10, 20, 10],
  position = [0, 0, 0],
  color = '#ffffff',
  size = 0.05,
  opacity = 0.6,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const scroll = useScroll();
  const { height } = useThree((state) => state.viewport);

  const scrollVelocity = useRef(0);
  const lastScrollOffset = useRef(0);

  const particleData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const basePositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * scale[0];
      const y = (Math.random() - 0.5) * scale[1];
      const z = (Math.random() - 0.5) * scale[2];

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      basePositions[i * 3] = x;
      basePositions[i * 3 + 1] = y;
      basePositions[i * 3 + 2] = z;

      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    return { positions, velocities, basePositions };
  }, [count, scale]);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uScrollVelocity: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uSize: { value: size },
        uOpacity: { value: opacity },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uScrollVelocity;
        uniform float uSize;

        varying float vIntensity;

        void main() {
          vec3 pos = position;

          float streakLength = abs(uScrollVelocity) * 15.0;
          streakLength = clamp(streakLength, 0.0, 3.0);

          pos.y -= streakLength * sign(uScrollVelocity);

          vIntensity = clamp(1.0 - (streakLength / 3.0), 0.3, 1.0);

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          gl_PointSize = uSize * (300.0 / -mvPosition.z) * (1.0 + streakLength * 2.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;

        varying float vIntensity;

        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);

          if (dist > 0.5) discard;

          float alpha = (1.0 - dist * 2.0) * uOpacity * vIntensity;

          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [color, size, opacity]);

  useFrame((state, delta) => {
    if (!pointsRef.current || !scroll) return;

    const currentOffset = scroll.offset;
    scrollVelocity.current = (currentOffset - lastScrollOffset.current) / delta;
    lastScrollOffset.current = currentOffset;

    scrollVelocity.current = THREE.MathUtils.lerp(
      scrollVelocity.current,
      (currentOffset - lastScrollOffset.current) / delta,
      0.1
    );

    shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    shaderMaterial.uniforms.uScrollVelocity.value = scrollVelocity.current;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      positions[i * 3] = particleData.basePositions[i * 3] +
        Math.sin(time * 0.2 + i * 0.1) * 0.1 +
        particleData.velocities[i * 3] * time;

      positions[i * 3 + 1] = particleData.basePositions[i * 3 + 1] +
        Math.cos(time * 0.15 + i * 0.1) * 0.1 +
        particleData.velocities[i * 3 + 1] * time;

      positions[i * 3 + 2] = particleData.basePositions[i * 3 + 2] +
        Math.sin(time * 0.25 + i * 0.1) * 0.05 +
        particleData.velocities[i * 3 + 2] * time;

      if (Math.abs(positions[i * 3 + 1] - particleData.basePositions[i * 3 + 1]) > scale[1] / 2) {
        positions[i * 3 + 1] = particleData.basePositions[i * 3 + 1];
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particleData.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <primitive object={shaderMaterial} attach="material" />
    </points>
  );
};
