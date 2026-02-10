"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TakeControlInput from "@/components/TakeControlInput";
import OnboardingModal from "@/components/OnboardingModal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative w-full overflow-hidden">
      <Navbar />

      <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-6 z-10">
        <Hero />
        <TakeControlInput onFocus={() => setIsModalOpen(true)} />
      </div>

      <OnboardingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}
