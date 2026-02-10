"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, Zap, Target, Bookmark } from "lucide-react";

export default function Dashboard() {
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
            <div className="col-span-7 flex flex-col items-center justify-center p-8 bg-black">
                <div className="flex gap-8 w-full max-w-4xl justify-center">
                    {/* Button 1: Vent Out */}
                    <button className="group relative w-64 h-64 rounded-full border border-[#333] hover:border-[#C25E00] bg-black flex flex-col items-center justify-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(194,94,0,0.2)]">
                        <div className="absolute inset-0 rounded-full border border-[#C25E00] opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-500"></div>
                        <h2 className="text-2xl font-serif font-bold text-white mb-2 z-10">
                            VENT OUT
                        </h2>
                        <p className="text-xs text-[#A3A3A3] group-hover:text-[#EAEAEA] z-10 transition-colors">
                            Deep, unfiltered talk.
                        </p>
                    </button>

                    {/* Button 2: Bro Tip */}
                    <button className="group relative w-64 h-64 rounded-full border border-[#333] hover:border-[#C25E00] bg-black flex flex-col items-center justify-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(194,94,0,0.2)]">
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

            {/* Right Sidebar (Cols 3) */}
            <div className="col-span-3 border-l border-[#333] p-4 flex flex-col gap-6">
                {/* Goals */}
                <div>
                    <h3 className="text-xs text-[#A3A3A3] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Target className="w-3 h-3" />
                        Current Goals
                    </h3>
                    <div className="p-3 border border-[#333] rounded bg-[#111] mb-2">
                        <p className="text-sm text-[#EAEAEA]">Hit the gym 5x/week</p>
                        <div className="w-full bg-[#333] h-1 mt-2 rounded-full overflow-hidden">
                            <div className="bg-[#C25E00] w-[60%] h-full"></div>
                        </div>
                    </div>
                    <div className="p-3 border border-[#333] rounded bg-[#111]">
                        <p className="text-sm text-[#EAEAEA]">Read 10 pages daily</p>
                        <div className="w-full bg-[#333] h-1 mt-2 rounded-full overflow-hidden">
                            <div className="bg-[#C25E00] w-[30%] h-full"></div>
                        </div>
                    </div>
                </div>

                {/* Saved Tips */}
                <div className="mt-4">
                    <h3 className="text-xs text-[#A3A3A3] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Bookmark className="w-3 h-3" />
                        Saved Wisdom
                    </h3>
                    <ul className="space-y-3">
                        <li className="text-sm text-[#EAEAEA]/80 border-b border-[#333] pb-2">
                            "Discipline eats motivation for breakfast."
                        </li>
                        <li className="text-sm text-[#EAEAEA]/80 border-b border-[#333] pb-2">
                            "Focus on the process, not the outcome."
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
