import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextDecoder } from './TextDecoder';
import { ViewState } from '../types';

interface TransitionCurtainProps {
    isVisible: boolean;
    targetView?: ViewState;
}

// Custom easing for an ultra-premium "liquid" feel (EaseInOutQuart)
const TRANSITION_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

export const TransitionCurtain: React.FC<TransitionCurtainProps> = ({ isVisible, targetView }) => {
    // Format the view name for display (e.g., PRIVACY_POLICY -> PRIVACY POLICY)
    const displayLabel = (targetView || 'SYSTEM').replace(/_/g, ' ');

    return (
        <AnimatePresence mode='wait'>
            {isVisible && (
                <>
                    {/* --- Layer Stack Logic ---
                        Unidirectional Wipe: Bottom -> Top
                        Monochromatic Palette (Neutral Grays/Blacks)
                        Z-Index Boosted to >200 to ensure coverage over everything.
                    */}

                    {/* Layer 3: Deepest Accent (Neutral Black) - The Tail */}
                    <motion.div
                        className="fixed inset-0 z-[200] bg-[#0a0a0a] pointer-events-none" // Neutral 950
                        initial={{ clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" }}
                        animate={{ clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)" }}
                        exit={{ 
                            clipPath: "polygon(0 0%, 100% 0%, 100% 0%, 0 0%)",
                            transition: {
                                duration: 0.9,
                                ease: TRANSITION_EASE,
                                delay: 0.2 // Exit: Last
                            }
                        }}
                        transition={{ 
                            duration: 0.9,
                            ease: TRANSITION_EASE,
                            delay: 0, // Enter: First
                        }}
                    />

                    {/* Layer 2: Mid Accent (Dark Gray) - The Body */}
                    <motion.div
                        className="fixed inset-0 z-[201] bg-[#171717] pointer-events-none" // Neutral 900
                        initial={{ clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" }}
                        animate={{ clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)" }}
                        exit={{ 
                            clipPath: "polygon(0 0%, 100% 0%, 100% 0%, 0 0%)",
                            transition: {
                                duration: 0.9,
                                ease: TRANSITION_EASE,
                                delay: 0.1 // Exit: Second
                            }
                        }}
                        transition={{ 
                            duration: 0.9,
                            ease: TRANSITION_EASE,
                            delay: 0.05, // Enter: Second
                        }}
                    />

                    {/* Layer 1: Main Black - The Master Layer */}
                    <motion.div
                        className="fixed inset-0 z-[202] bg-[#050505] pointer-events-none flex items-center justify-center overflow-hidden border-t border-white/10"
                        initial={{ clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" }}
                        animate={{ clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)" }}
                        exit={{ 
                            clipPath: "polygon(0 0%, 100% 0%, 100% 0%, 0 0%)",
                            transition: {
                                duration: 0.9,
                                ease: TRANSITION_EASE,
                                delay: 0 // Exit: First (Reveals layers behind)
                            }
                        }}
                        transition={{ 
                            duration: 0.9, 
                            ease: TRANSITION_EASE,
                            delay: 0.1 // Enter: Last (Covers everything)
                        }}
                    >
                        {/* --- Internal Content --- */}
                        
                        {/* Subtle Grid Pattern */}
                        <div className="absolute inset-0 opacity-10" 
                             style={{ 
                                 backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
                                 backgroundSize: '40px 40px' 
                             }} 
                        />

                        {/* Scanner Light Effect - Neutral */}
                        <motion.div 
                            className="absolute inset-0 bg-gradient-to-t from-white/5 via-transparent to-transparent h-[40%]"
                            animate={{ bottom: ['-40%', '140%'] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />

                        {/* Content Container */}
                        <div className="relative z-10 flex flex-col items-center justify-center gap-8 transform scale-110 md:scale-100">
                            {/* Decoding Text */}
                            <motion.div 
                                className="flex flex-col items-center"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30, filter: "blur(20px)" }}
                                transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                            >
                                <div className="flex items-center gap-4 mb-2">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                                    <div className="font-mono text-xs text-gray-400 tracking-[0.3em] uppercase">Perception Engine</div>
                                </div>
                                <div className="text-5xl md:text-8xl font-display font-bold text-white tracking-widest uppercase relative mix-blend-screen px-4 text-center">
                                    {/* Set fixed duration to ensure consistent transition timing regardless of text length */}
                                    <TextDecoder text={displayLabel} delay={300} duration={700} />
                                </div>
                            </motion.div>
                            
                            {/* Animated Line */}
                            <div className="relative w-32 md:w-48 h-[2px] bg-gray-900 overflow-hidden">
                                <motion.div
                                    className="absolute inset-0 bg-white"
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '100%' }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                />
                            </div>
                            
                            {/* Status */}
                            <motion.div 
                                className="font-mono text-[10px] text-gray-500 tracking-[0.5em] uppercase"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                Initializing Protocol...
                            </motion.div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};