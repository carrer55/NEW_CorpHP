import { useEffect, useRef, useState } from 'react';

export type QualityLevel = 'low' | 'medium' | 'high';

export interface QualitySettings {
  level: QualityLevel;
  transmissionSamples: number;
  transmissionResolution: number;
  geometryDetail: number;
  shadowsEnabled: boolean;
  particleCount: number;
  updateThrottle: number;
}

const QUALITY_PRESETS: Record<QualityLevel, QualitySettings> = {
  low: {
    level: 'low',
    transmissionSamples: 2,
    transmissionResolution: 256,
    geometryDetail: 0.5,
    shadowsEnabled: false,
    particleCount: 0.3,
    updateThrottle: 2,
  },
  medium: {
    level: 'medium',
    transmissionSamples: 4,
    transmissionResolution: 512,
    geometryDetail: 0.75,
    shadowsEnabled: true,
    particleCount: 0.6,
    updateThrottle: 1,
  },
  high: {
    level: 'high',
    transmissionSamples: 8,
    transmissionResolution: 1024,
    geometryDetail: 1.0,
    shadowsEnabled: true,
    particleCount: 1.0,
    updateThrottle: 1,
  },
};

export class PerformanceMonitor {
  private frames: number[] = [];
  private lastTime = performance.now();
  private frameCount = 0;
  private readonly maxSamples = 60;

  update(): number {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    if (delta > 0) {
      const fps = 1000 / delta;
      this.frames.push(fps);

      if (this.frames.length > this.maxSamples) {
        this.frames.shift();
      }
    }

    this.frameCount++;
    return this.getAverageFPS();
  }

  getAverageFPS(): number {
    if (this.frames.length === 0) return 60;
    const sum = this.frames.reduce((a, b) => a + b, 0);
    return sum / this.frames.length;
  }

  reset(): void {
    this.frames = [];
    this.frameCount = 0;
    this.lastTime = performance.now();
  }
}

export function useAdaptiveQuality(initialQuality: QualityLevel = 'high') {
  const [quality, setQuality] = useState<QualityLevel>(initialQuality);
  const [settings, setSettings] = useState<QualitySettings>(QUALITY_PRESETS[initialQuality]);
  const monitorRef = useRef<PerformanceMonitor>(new PerformanceMonitor());
  const checkCountRef = useRef(0);

  useEffect(() => {
    const monitor = monitorRef.current;
    let rafId: number;

    const checkPerformance = () => {
      const fps = monitor.update();
      checkCountRef.current++;

      if (checkCountRef.current >= 120) {
        const avgFPS = monitor.getAverageFPS();

        if (avgFPS < 25 && quality !== 'low') {
          setQuality('low');
          setSettings(QUALITY_PRESETS.low);
          console.log('🎮 Performance: Switching to LOW quality (FPS:', Math.round(avgFPS), ')');
        } else if (avgFPS < 40 && quality === 'high') {
          setQuality('medium');
          setSettings(QUALITY_PRESETS.medium);
          console.log('🎮 Performance: Switching to MEDIUM quality (FPS:', Math.round(avgFPS), ')');
        } else if (avgFPS > 55 && quality === 'medium') {
          setQuality('high');
          setSettings(QUALITY_PRESETS.high);
          console.log('🎮 Performance: Switching to HIGH quality (FPS:', Math.round(avgFPS), ')');
        } else if (avgFPS > 45 && quality === 'low') {
          setQuality('medium');
          setSettings(QUALITY_PRESETS.medium);
          console.log('🎮 Performance: Switching to MEDIUM quality (FPS:', Math.round(avgFPS), ')');
        }

        checkCountRef.current = 0;
        monitor.reset();
      }

      rafId = requestAnimationFrame(checkPerformance);
    };

    rafId = requestAnimationFrame(checkPerformance);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [quality]);

  return { quality, settings };
}

export function useFrameThrottle(callback: () => void, throttle: number = 1) {
  const frameCountRef = useRef(0);

  return () => {
    frameCountRef.current++;
    if (frameCountRef.current >= throttle) {
      callback();
      frameCountRef.current = 0;
    }
  };
}

export function detectDeviceCapability(): QualityLevel {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    return 'low';
  }

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  if (!gl) {
    return 'low';
  }

  const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
  if (debugInfo) {
    const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    if (renderer.toLowerCase().includes('intel')) {
      return 'medium';
    }
  }

  const deviceMemory = (navigator as any).deviceMemory;
  if (deviceMemory && deviceMemory < 4) {
    return 'medium';
  }

  return 'high';
}
