import React from "react";

export default function Hero() {
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-6 z-10 relative">
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-widest text-[#EAEAEA] max-w-5xl leading-tight">
                Motivation is a<br />
                False God.<br />
                <span className="text-[#C25E00]">DISCIPLINE</span> is Manhood.
            </h1>
            <p className="font-mono text-[#A3A3A3] text-sm md:text-lg text-center max-w-2xl tracking-wider mt-6">
                The AI Brother that helps men rebuild Confidence, Discipline, and Self-Respect one day at a time.
            </p>
        </div>
    );
}
