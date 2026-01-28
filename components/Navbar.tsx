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
        <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 border-b border-white/20">
            <div
                className="font-mono text-sm tracking-widest text-[#EAEAEA]"
                suppressHydrationWarning
            >
                {dateStr}
            </div>

            <div className="flex items-center gap-8">
                <Link href="#" className="font-mono text-sm hover:text-accent transition-colors">
                    INSPO
                </Link>
                <Link href="#" className="font-mono text-sm hover:text-accent transition-colors">
                    LOG-IN
                </Link>
            </div>
        </nav>
    );
}
