"use client";

import React from "react";
import Link from "next/link";

export default function Navbar() {
    // We use direct date generation with suppressHydrationWarning to avoid wait and hydration errors
    const now = new Date();
    const dateStr = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    }).format(now).toUpperCase();

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {/* Logo - Centered */}
            <div className="absolute left-1/2 -translate-x-1/2 top-8 pointer-events-auto">
                <span className="font-serif text-3xl md:text-5xl font-bold tracking-widest text-[#EAEAEA] drop-shadow-lg">SENTINEL</span>
            </div>

            {/* Navigation Links - Top Right */}
            <div className="absolute right-8 top-8 flex flex-col gap-4 text-xs md:text-sm text-right font-sans tracking-wide text-[#EAEAEA] pointer-events-auto">
                <div
                    className="hover:text-accent transition-colors cursor-default"
                    suppressHydrationWarning
                >
                    {dateStr}
                </div>
                <Link href="#" className="hover:text-accent transition-colors">
                    INSPO
                </Link>
                <Link href="#" className="hover:text-accent transition-colors">
                    LOG-IN
                </Link>
            </div>
        </div>
    );
}
