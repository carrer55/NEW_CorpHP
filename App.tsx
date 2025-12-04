import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { SceneWrapper } from './components/Scene';
import { CustomCursor } from './components/CustomCursor';
import { GrainOverlay } from './components/GrainOverlay';
import { Loader } from './components/Loader';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { TransitionCurtain } from './components/TransitionCurtain';
import { ContentPages } from './components/ContentPages';
import { MobileSwipeScroll } from './components/MobileSwipeScroll';
import { ViewState } from './types';

// Custom hook for mobile detection
const useIsMobile = () => {
    // Initialize with correct value to avoid flash of content/cursor
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth <= 768;
        }
        return false;
    });

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        // Add listener
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    return isMobile;
};

const App = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [view, setView] = useState<ViewState>('HOME');
    const [targetView, setTargetView] = useState<ViewState>('HOME'); // Track target for transition text
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isCanvasVisible, setIsCanvasVisible] = useState(true); // New state to control Canvas visibility
    const [resetKey, setResetKey] = useState(0); // Key to force re-mount of Home scene/scroll
    const isMobile = useIsMobile();

    // Simulate initial asset loading
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleNavigate = useCallback((newView: ViewState) => {
        if (isTransitioning) return;
        if (newView === view && newView !== 'HOME') return;

        setTargetView(newView);
        setIsTransitioning(true);

        setTimeout(() => {
            setIsCanvasVisible(false);

            if (newView === view) {
                setResetKey(prev => prev + 1);
            } else {
                setView(newView);
            }

            setTimeout(() => {
                setIsCanvasVisible(true);
                setIsTransitioning(false);
            }, 150);

        }, 1050);
    }, [isTransitioning, view]);

    return (
        <div className={`w-full h-screen bg-[#050505] text-white overflow-hidden relative ${isMobile ? '' : 'cursor-none'}`}>
            <GrainOverlay />
            
            {/* Only show custom cursor on non-mobile devices */}
            {!isMobile && <CustomCursor />}
            
            <AnimatePresence>
                {!isLoaded && <Loader key="loader" />}
            </AnimatePresence>

            <Navbar currentView={view} onNavigate={handleNavigate} />
            
            <TransitionCurtain isVisible={isTransitioning} targetView={targetView} />

            <AnimatePresence mode="wait">
                {view !== 'HOME' && <ContentPages view={view} onNavigate={handleNavigate} key="content" />}
            </AnimatePresence>

            {/* Mobile Home View: Render special SwipeScroll component instead of main Canvas */}
            {view === 'HOME' && isMobile ? (
                <div className={`absolute inset-0 z-0 transition-opacity duration-75 ${isCanvasVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <MobileSwipeScroll key={`mobile-home-${resetKey}`} onNavigate={handleNavigate} />
                </div>
            ) : (
                /* Desktop Home View & Other Views: Main Canvas */
                <div className={`absolute inset-0 z-0 transition-opacity duration-75 ${isCanvasVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <Canvas
                        dpr={[1, 1.5]}
                        camera={{ position: [0, 0, 5], fov: 45 }}
                        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
                        className="w-full h-full"
                    >
                        <Suspense fallback={null}>
                            <SceneWrapper
                                key={`scene-${view}-${resetKey}`}
                                mode={view === 'HOME' ? 'HOME' : 'AMBIENT'}
                                onNavigate={handleNavigate}
                            />
                        </Suspense>
                    </Canvas>
                </div>
            )}
        </div>
    );
};

export default App;