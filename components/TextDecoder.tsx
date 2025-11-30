import React, { useEffect, useState, useRef } from 'react';

const CHARS = 'ABCDEFGHIJKLNMOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

interface TextDecoderProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number; // Target duration in ms to complete decoding
}

export const TextDecoder: React.FC<TextDecoderProps> = ({ text, className = '', delay = 0, duration = 800 }) => {
    const [displayText, setDisplayText] = useState('');
    const iterationRef = useRef(0);
    const intervalRef = useRef<any>(null);
    const startedRef = useRef(false);

    useEffect(() => {
        const startDecoding = () => {
            clearInterval(intervalRef.current);
            iterationRef.current = 0;
            
            // Dynamic speed calculation:
            // Determine increment per tick (30ms) to ensure animation finishes roughly within `duration`.
            // Example: 
            // - "PRODUCT" (7 chars), duration 800ms -> 26 ticks -> increment ~0.27 chars/tick
            // - "PRIVACY POLICY" (14 chars), duration 800ms -> 26 ticks -> increment ~0.53 chars/tick
            const totalTicks = duration / 30;
            const calculatedIncrement = text.length / totalTicks;
            
            // Use the calculated speed, but maintain a minimum speed (0.33) so short texts don't animate too slowly.
            // If text is short, it will finish faster than duration. If long, it speeds up to fit duration.
            const increment = Math.max(calculatedIncrement, 1/3);

            intervalRef.current = setInterval(() => {
                setDisplayText(prev => text
                    .split('')
                    .map((letter, index) => {
                        if (index < iterationRef.current) {
                            return text[index];
                        }
                        return CHARS[Math.floor(Math.random() * CHARS.length)];
                    })
                    .join('')
                );

                if (iterationRef.current >= text.length) {
                    clearInterval(intervalRef.current);
                }

                iterationRef.current += increment;
            }, 30);
        };

        const timeout = setTimeout(() => {
            if (!startedRef.current) {
                startedRef.current = true;
                startDecoding();
            }
        }, delay);

        return () => {
            clearTimeout(timeout);
            clearInterval(intervalRef.current);
        };
    }, [text, delay, duration]);

    return <span className={className}>{displayText}</span>;
};