import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewState } from '../types';

interface NavbarProps {
    currentView: ViewState;
    onNavigate: (view: ViewState) => void;
}

export const Navbar: React.FC<NavbarProps> = memo(({ currentView, onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const links: { id: ViewState; label: string }[] = [
        { id: 'PRODUCT', label: 'PRODUCT' },
        { id: 'ABOUT_US', label: 'ABOUT US' },
        { id: 'CONTACT', label: 'CONTACT' }
    ];

    const handleMobileNavigate = (id: ViewState) => {
        setIsMenuOpen(false);
        onNavigate(id);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            <nav className="fixed top-0 left-0 w-full p-5 md:p-10 flex justify-between items-center z-50 mix-blend-difference text-white pointer-events-none" style={{ willChange: 'transform' }}>
                <div
                    className="pointer-events-auto cursor-pointer relative z-50"
                    onClick={() => {
                        setIsMenuOpen(false);
                        onNavigate('HOME');
                    }}
                    data-hover
                    style={{ willChange: 'transform' }}
                >
                    <div className="text-xl md:text-3xl font-bold font-goudy tracking-tight">
                        .Found Inc.
                    </div>
                    <div className="text-[10px] font-mono text-gray-400 tracking-widest">
                        SYSTEM V.2.0
                    </div>
                </div>

                <div className="flex items-center gap-8 pointer-events-auto">
                    {/* Desktop Menu */}
                    <div className="hidden md:flex gap-12 font-display text-sm font-bold tracking-widest">
                        {links.map((link) => (
                            <button
                                key={link.id}
                                onClick={() => onNavigate(link.id)}
                                className={`relative group transition-transform duration-200 ${currentView === link.id ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                                data-hover
                                style={{ willChange: 'transform' }}
                            >
                                {link.label}
                                <span className={`absolute -bottom-2 left-0 w-full h-[2px] bg-white transform origin-left transition-transform duration-200 ${currentView === link.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                            </button>
                        ))}
                    </div>
                    
                    {/* Mobile Menu Toggle */}
                    <button 
                        className="md:hidden text-white font-display font-bold relative z-50 tracking-widest"
                        data-hover
                        onClick={toggleMenu}
                    >
                        {isMenuOpen ? 'CLOSE' : 'MENU'}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: "-100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "-100%" }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center pointer-events-auto"
                    >
                        <div className="flex flex-col gap-10 text-center">
                            {links.map((link) => (
                                <motion.button
                                    key={link.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    onClick={() => handleMobileNavigate(link.id)}
                                    className="text-3xl font-display font-bold text-white hover:text-gray-400 transition-colors tracking-widest"
                                >
                                    {link.label}
                                </motion.button>
                            ))}
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                onClick={() => handleMobileNavigate('HOME')}
                                className="text-sm font-mono text-gray-500 hover:text-white transition-colors tracking-widest mt-8"
                            >
                                HOME
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
});