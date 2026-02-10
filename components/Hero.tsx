import React from "react";

export default function Hero() {
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-6 z-10 relative">
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold uppercase tracking-widest text-[#EAEAEA] max-w-5xl leading-tight">
                Motivation is a<br />
                False God.<br />
                <span className="text-[#C25E00]">DISCIPLINE</span> is Manhood.
            </h1>
            <p className="font-mono text-sm md:text-base text-[#A3A3A3] text-center max-w-lg mt-6 tracking-wide">
                The AI Brother that helps men rebuild Confidence, Discipline, and Self-Respect one day at a time.
            </p>
        </div>
    );
}
