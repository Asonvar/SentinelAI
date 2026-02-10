"use client";

import React from "react";

export default function TakeControlInput({ onFocus }: { onFocus?: () => void }) {
    return (
        <div className="w-full max-w-md mt-12 relative group">
            <div className="absolute -inset-0.5 bg-[#C25E00] opacity-20 group-hover:opacity-40 blur transition duration-1000 group-hover:duration-200"></div>
            <input
                type="text"
                placeholder="> Take Control"
                onFocus={onFocus}
                className="relative w-full bg-black border border-[#C25E00] text-[#EAEAEA] placeholder:text-neutral-500 font-mono text-lg px-6 py-4 focus:outline-none focus:ring-1 focus:ring-[#C25E00] shadow-[0_4px_0_#C25E00] active:shadow-none active:translate-y-1 transition-all caret-[#C25E00]"
            />
        </div>
    );
}

