import React from "react";

export default function Hero() {
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-8 z-10 relative">
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-widest text-[#EAEAEA] max-w-4xl leading-tight">
                Motivation is a<br />
                <span className="text-[#C25E00]">False God</span>
            </h1>
            <p className="font-mono text-white/50 text-sm md:text-base tracking-wider max-w-lg">
                DISCIPLINE IS THE ONLY CURRENCY THAT MATTERS.
            </p>
        </div>
    );
}
