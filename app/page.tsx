"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TakeControlInput from "@/components/TakeControlInput";
import OnboardingModal from "@/components/OnboardingModal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col relative w-full">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4 w-full h-full pb-32">
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
