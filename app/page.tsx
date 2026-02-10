"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TakeControlInput from "@/components/TakeControlInput";
import OnboardingModal from "@/components/OnboardingModal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative w-full overflow-hidden">
      <Navbar />
      <Hero />
      <TakeControlInput onFocus={() => setIsModalOpen(true)} />
      <OnboardingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}
