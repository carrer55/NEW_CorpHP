import React from 'react';

export const GrainOverlay = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-40 opacity-[0.07] mix-blend-overlay">
            <svg className="w-full h-full">
                <filter id="noiseFilter">
                    <feTurbulence 
                        type="fractalNoise" 
                        baseFrequency="0.80" 
                        numOctaves="3" 
                        stitchTiles="stitch" 
                    />
                </filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)" />
            </svg>
        </div>
    );
};