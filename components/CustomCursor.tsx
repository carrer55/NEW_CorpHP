import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const CustomCursor = () => {
    // Use motion values to track mouse position without triggering re-renders
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Dot configuration: High stiffness, low mass for instant, snappy response
    const springConfigDot = { damping: 50, stiffness: 1000, mass: 0.1 };
    const dotX = useSpring(cursorX, springConfigDot);
    const dotY = useSpring(cursorY, springConfigDot);

    // Ring configuration: Slightly more damping/mass for a smooth follow effect
    const springConfigRing = { damping: 40, stiffness: 400, mass: 0.5 };
    const ringX = useSpring(cursorX, springConfigRing);
    const ringY = useSpring(cursorY, springConfigRing);

    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'A' || 
                target.tagName === 'BUTTON' || 
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.closest('a') || 
                target.closest('button') || 
                target.getAttribute('data-hover')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [cursorX, cursorY]);

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 w-4 h-4 bg-white rounded-full pointer-events-none z-[100] mix-blend-difference"
                style={{
                    x: dotX,
                    y: dotY,
                    marginLeft: -8, // Center the 16px (w-4) cursor
                    marginTop: -8
                }}
                animate={{
                    scale: isHovering ? 4 : 1,
                }}
                transition={{
                    scale: { type: "spring", stiffness: 400, damping: 25 }
                }}
            />
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 border border-white rounded-full pointer-events-none z-[100] mix-blend-difference opacity-50"
                style={{
                    x: ringX,
                    y: ringY,
                    marginLeft: -16, // Center the 32px (w-8) cursor
                    marginTop: -16
                }}
                animate={{
                    scale: isHovering ? 2 : 1,
                }}
                transition={{
                    scale: { type: "spring", stiffness: 300, damping: 25 }
                }}
            />
        </>
    );
};