import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const Loader = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate loading progress
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return Math.min(prev + Math.random() * 15, 100);
            });
        }, 150);

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center text-white"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
        >
            <div className="w-64 relative">
                <div className="font-display text-4xl mb-4 font-bold tracking-widest text-center">
                    {Math.round(progress)}%
                </div>
                <div className="h-1 w-full bg-gray-900 overflow-hidden">
                    <motion.div
                        className="h-full bg-white"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 50 }}
                    />
                </div>
                <div className="mt-2 text-xs text-gray-500 font-mono uppercase flex justify-between">
                    <span>System Boot</span>
                    <span>Initializing Assets</span>
                </div>
            </div>
        </motion.div>
    );
};