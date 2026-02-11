"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageSquare, Zap, Target, Bookmark } from "lucide-react";

export default function Dashboard() {
    const [mode, setMode] = useState<'initial' | 'vent' | 'brotip'>('initial');

    return (
        <div className="grid grid-cols-12 h-screen bg-black text-white font-sans overflow-hidden">
            {/* Left Sidebar (Cols 2) */}
            <div className="col-span-2 border-r border-[#333] p-4 flex flex-col gap-6">
                <div className="mb-6">
                    <h2 className="text-xl font-serif font-bold tracking-widest text-[#EAEAEA] mb-4">SENTINEL</h2>
                </div>

                {/* Vent-Out List */}
                <div>
                    <h3 className="text-xs text-[#A3A3A3] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" />
                        Vent Sessions
                    </h3>
                    <ul className="space-y-2">
                        <li className="text-sm text-[#EAEAEA]/60 hover:text-[#C25E00] cursor-pointer transition-colors truncate">
                            Late night thoughts...
                        </li>
                        <li className="text-sm text-[#EAEAEA]/60 hover:text-[#C25E00] cursor-pointer transition-colors truncate">
                            Work stress handling
                        </li>
                    </ul>
                </div>

                {/* Bro-Tip List */}
                <div className="mt-4">
                    <h3 className="text-xs text-[#A3A3A3] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        Bro Tips
                    </h3>
                    <ul className="space-y-2">
                        <li className="text-sm text-[#EAEAEA]/60 hover:text-[#C25E00] cursor-pointer transition-colors truncate">
                            Morning routine hack
                        </li>
                        <li className="text-sm text-[#EAEAEA]/60 hover:text-[#C25E00] cursor-pointer transition-colors truncate">
                            Confidence booster
                        </li>
                    </ul>
                </div>
            </div>

            {/* Center Stage (Cols 7) */}
            <div className="col-span-7 flex flex-col h-full bg-black relative">
                {mode === 'initial' ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        <div className="flex gap-8 w-full max-w-4xl justify-center">
                            {/* Button 1: Vent Out */}
                            <button
                                onClick={() => setMode('vent')}
                                className="group relative w-64 h-64 rounded-full border border-[#333] hover:border-[#C25E00] bg-black flex flex-col items-center justify-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(194,94,0,0.2)]"
                            >
                                <div className="absolute inset-0 rounded-full border border-[#C25E00] opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-500"></div>
                                <h2 className="text-2xl font-serif font-bold text-white mb-2 z-10">
                                    VENT OUT
                                </h2>
                                <p className="text-xs text-[#A3A3A3] group-hover:text-[#EAEAEA] z-10 transition-colors">
                                    Deep, unfiltered talk.
                                </p>
                            </button>

                            {/* Button 2: Bro Tip */}
                            <button
                                onClick={() => setMode('brotip')}
                                className="group relative w-64 h-64 rounded-full border border-[#333] hover:border-[#C25E00] bg-black flex flex-col items-center justify-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(194,94,0,0.2)]"
                            >
                                <div className="absolute inset-0 rounded-full border border-[#C25E00] opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-500"></div>
                                <h2 className="text-2xl font-serif font-bold text-white mb-2 z-10">
                                    BRO TIP
                                </h2>
                                <p className="text-xs text-[#A3A3A3] group-hover:text-[#EAEAEA] z-10 transition-colors">
                                    Quick, tactical advice.
                                </p>
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="absolute top-0 left-0 w-full p-6 text-center border-b border-[#333] z-10 bg-black/50 backdrop-blur-md">
                            <h2 className="text-xl font-serif font-bold tracking-[0.2em] text-[#EAEAEA] uppercase">
                                {mode === 'vent' ? 'VENT SESSION' : 'BRO TIP'}
                            </h2>
                        </div>

                        {/* Message Area */}
                        <div className="flex-1 overflow-y-auto p-8 pt-24 pb-32">
                            {/* Messages will go here */}
                        </div>

                        {/* Input Area */}
                        <div className="absolute bottom-0 left-0 w-full p-6 bg-black border-t border-[#333]">
                            <div className="max-w-3xl mx-auto">
                                <input
                                    type="text"
                                    placeholder="Go ahead, I am here for you..."
                                    className="w-full bg-black border border-[#C25E00] text-[#EAEAEA] placeholder:text-neutral-600 font-mono text-base px-6 py-4 focus:outline-none focus:shadow-[0_0_15px_rgba(194,94,0,0.2)] transition-all"
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Right Sidebar (Cols 3) */}
            <div className="col-span-3 border-l border-[#333] p-4 flex flex-col gap-6 overflow-y-auto">
                {/* Daily Goals */}
                <div>
                    <h3 className="text-xs text-[#A3A3A3] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Target className="w-3 h-3" />
                        Daily Goals
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 p-2 hover:bg-[#111] rounded transition-colors cursor-pointer group">
                            <div className="w-4 h-4 border border-[#333] rounded-sm group-hover:border-[#C25E00] transition-colors"></div>
                            <span className="text-sm text-[#EAEAEA]/80">Hit the gym</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 hover:bg-[#111] rounded transition-colors cursor-pointer group">
                            <div className="w-4 h-4 border border-[#333] rounded-sm group-hover:border-[#C25E00] transition-colors"></div>
                            <span className="text-sm text-[#EAEAEA]/80">Read 10 pages</span>
                        </div>
                    </div>
                </div>

                {/* Weekly Goals */}
                <div className="mt-2">
                    <h3 className="text-xs text-[#A3A3A3] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Target className="w-3 h-3" />
                        Weekly Goals
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 p-2 hover:bg-[#111] rounded transition-colors cursor-pointer group">
                            <div className="w-4 h-4 border border-[#333] rounded-sm group-hover:border-[#C25E00] transition-colors"></div>
                            <span className="text-sm text-[#EAEAEA]/80">Run 10km total</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 hover:bg-[#111] rounded transition-colors cursor-pointer group">
                            <div className="w-4 h-4 border border-[#333] rounded-sm group-hover:border-[#C25E00] transition-colors"></div>
                            <span className="text-sm text-[#EAEAEA]/80">Complete project</span>
                        </div>
                    </div>
                </div>

                {/* Long-Term Goals */}
                <div className="mt-2">
                    <h3 className="text-xs text-[#A3A3A3] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Target className="w-3 h-3" />
                        Long-Term Vision
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-sm text-[#EAEAEA]/60 px-2">
                        <li>Bench press 100kg</li>
                        <li>Launch the startup</li>
                        <li>Master discipline</li>
                    </ul>
                </div>

                {/* Saved Tips */}
                <div className="mt-4">
                    <h3 className="text-xs text-[#A3A3A3] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Bookmark className="w-3 h-3" />
                        Saved Tips
                    </h3>
                    <ul className="space-y-3">
                        <li className="text-sm text-[#EAEAEA]/80 border-b border-[#333] pb-2 cursor-pointer hover:text-[#C25E00] transition-colors">
                            "Discipline eats motivation for breakfast."
                        </li>
                        <li className="text-sm text-[#EAEAEA]/80 border-b border-[#333] pb-2 cursor-pointer hover:text-[#C25E00] transition-colors">
                            "Focus on the process, not the outcome."
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
