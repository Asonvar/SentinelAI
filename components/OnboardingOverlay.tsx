"use client";

import React, { useState, useRef, useEffect } from "react";
import { QUESTION_SET_1 } from "@/constants/questions";
import { X } from "lucide-react";

interface Answer {
    questionId: number;
    answer: string;
}

interface OnboardingOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function OnboardingOverlay({ isOpen, onClose }: OnboardingOverlayProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [currentInput, setCurrentInput] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen, currentQuestionIndex]);

    if (!isOpen) return null;

    const handleAnalysis = (finalAnswers: Answer[]) => {
        setIsAnalyzing(true);
        console.log("Final Data for Analysis:", finalAnswers);
        // Simulation of analysis time
        setTimeout(() => {
            // Future logic here
        }, 3000);
    };

    const handleNext = () => {
        if (!currentInput.trim()) return;

        const currentQuestion = QUESTION_SET_1[currentQuestionIndex];
        const newAnswers = [...answers, { questionId: currentQuestion.id, answer: currentInput }];
        setAnswers(newAnswers);
        setCurrentInput("");

        if (currentQuestionIndex < QUESTION_SET_1.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        } else {
            handleAnalysis(newAnswers);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleNext();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl">
            <div className="relative w-full max-w-2xl p-8 md:p-12 border border-[#C25E00] bg-black shadow-[0_0_50px_rgba(194,94,0,0.2)]">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-[#C25E00] transition-colors"
                >
                    <X size={24} />
                </button>

                {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
                        <div className="text-[#C25E00] font-mono text-xl animate-pulse tracking-widest">
                            SENTINEL IS ANALYZING...
                        </div>
                    </div>
                ) : (
                    <div key={currentQuestionIndex} className="space-y-8 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between text-[#C25E00] font-mono text-xs tracking-widest mb-8">
                            <span>QUESTION {currentQuestionIndex + 1} / {QUESTION_SET_1.length}</span>
                            <span>PHASE: INITIALIZATION</span>
                        </div>

                        <h2 className="font-serif text-2xl md:text-3xl text-[#EAEAEA] leading-relaxed">
                            {QUESTION_SET_1[currentQuestionIndex].text}
                        </h2>

                        <input
                            ref={inputRef}
                            type="text"
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-transparent border-b border-white/20 py-4 text-xl text-[#EAEAEA] placeholder:text-neutral-700 focus:outline-none focus:border-[#C25E00] transition-colors font-mono"
                            placeholder="Type your answer and press Enter..."
                            autoFocus
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
