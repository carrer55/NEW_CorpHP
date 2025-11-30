import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { SceneWrapper } from './components/Scene';
import { CustomCursor } from './components/CustomCursor';
import { GrainOverlay } from './components/GrainOverlay';
import { Loader } from './components/Loader';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { TransitionCurtain } from './components/TransitionCurtain';
import { ContentPages } from './components/ContentPages';
import { ViewState } from './types';

const App = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [view, setView] = useState<ViewState>('HOME');
    const [targetView, setTargetView] = useState<ViewState>('HOME'); // Track target for transition text
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isCanvasVisible, setIsCanvasVisible] = useState(true); // New state to control Canvas visibility

    // Simulate initial asset loading
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleNavigate = (newView: ViewState) => {
        if (newView === view || isTransitioning) return;
        
        setTargetView(newView);
        setIsTransitioning(true);
        
        // Timing logic synchronized with TransitionCurtain duration (0.9s duration + 0.1s max delay = 1.0s total enter time)
        
        // 1. Wait for curtain to fully cover. 
        // We give it exactly 1000ms. At this point the screen is BLACK.
        setTimeout(() => {
            // HIDE CANVAS immediately to prevent any visual glitches/artifacts from the previous scene
            // appearing while the new scene mounts or renders its first frame.
            setIsCanvasVisible(false);

            setView(newView);
            
            // 2. Buffer to ensure DOM updates and 3D scenes allow for a frame to render while hidden.
            // Increased buffer slightly to accommodate heavier pages like Privacy Policy.
            setTimeout(() => {
                // SHOW CANVAS again just before curtain reveals.
                // Since the curtain exit animation takes time, the canvas will be revealed behind it.
                setIsCanvasVisible(true);
                setIsTransitioning(false);
            }, 150); 
            
        }, 1050); // Slightly longer than 1.0s to ensure safety
    };

    return (
        <div className="w-full h-screen bg-[#050505] text-white overflow-hidden cursor-none relative">
            <GrainOverlay />
            <CustomCursor />
            
            <AnimatePresence>
                {!isLoaded && <Loader key="loader" />}
            </AnimatePresence>

            <Navbar currentView={view} onNavigate={handleNavigate} />
            
            <TransitionCurtain isVisible={isTransitioning} targetView={targetView} />

            <AnimatePresence mode="wait">
                {view !== 'HOME' && <ContentPages view={view} onNavigate={handleNavigate} key="content" />}
            </AnimatePresence>

            {/* Wrap Canvas in a transition div to handle the blackout smoothly */}
            <div className={`absolute inset-0 z-0 transition-opacity duration-75 ${isCanvasVisible ? 'opacity-100' : 'opacity-0'}`}>
                <Canvas
                    dpr={[1, 2]}
                    camera={{ position: [0, 0, 5], fov: 45 }}
                    gl={{ antialias: true, alpha: false }}
                    className="w-full h-full"
                >
                    <Suspense fallback={null}>
                        <SceneWrapper mode={view === 'HOME' ? 'HOME' : 'AMBIENT'} onNavigate={handleNavigate} />
                    </Suspense>
                </Canvas>
            </div>
        </div>
    );
};

export default App;