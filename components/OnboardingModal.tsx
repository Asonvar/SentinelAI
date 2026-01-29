"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QUESTION_SET_1 } from '../constants/questions';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);
            setAnswers([]);
            setInputValue("");
            setIsAnalyzing(false);
        }
    }, [isOpen]);

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (!inputValue.trim()) return; // Don't accept empty answers

            const newAnswers = [...answers, inputValue];
            setAnswers(newAnswers);
            setInputValue("");

            if (currentIndex < QUESTION_SET_1.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                // Final question answered
                setIsAnalyzing(true);

                try {
                    const response = await fetch('/api/analyze-profile', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ answers: newAnswers }),
                    });

                    const data = await response.json();
                    console.log('Analysis Result:', data);
                } catch (error) {
                    console.error('Error analyzing profile:', error);
                } finally {
                    setIsAnalyzing(false);
                    onClose();
                }
            }
        }
    };

    const currentQuestion = QUESTION_SET_1[currentIndex];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
                >
                    {isAnalyzing ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center"
                        >
                            <motion.h2
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className="text-3xl md:text-5xl font-['Cinzel',serif] text-orange-500 tracking-widest"
                            >
                                SENTINEL IS ANALYZING...
                            </motion.h2>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="w-full max-w-2xl px-6 text-center"
                        >
                            <h2 className="mb-8 text-3xl md:text-5xl font-['Cinzel',serif] text-white leading-tight">
                                {currentQuestion?.text}
                            </h2>

                            <div className="relative max-w-xl mx-auto">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type your answer and press Enter..."
                                    className="w-full bg-transparent border-b-2 border-orange-500 py-3 text-xl text-white placeholder-white/40 focus:outline-none focus:border-orange-400 transition-colors text-center"
                                    autoFocus
                                />
                            </div>

                            <div className="mt-8 text-white/30 text-sm font-light">
                                Question {currentIndex + 1} of {QUESTION_SET_1.length}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
