"use client";

import React from "react";

export default function TakeControlInput() {
    return (
        <div className="w-full max-w-xl mx-auto mt-12 relative group">
            <div className="absolute -inset-0.5 bg-[#C25E00] opacity-20 group-hover:opacity-40 blur transition duration-1000 group-hover:duration-200"></div>
            <input
                type="text"
                placeholder="> Take Control..."
                className="relative w-full bg-black border border-[#C25E00] text-[#EAEAEA] placeholder:text-neutral-500 font-mono text-lg px-6 py-4 focus:outline-none focus:ring-1 focus:ring-[#C25E00] shadow-[0_0_15px_rgba(194,94,0,0.1)] transition-all"
            />
        </div>
    );
}
