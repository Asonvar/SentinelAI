import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TakeControlInput from "@/components/TakeControlInput";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col relative w-full">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4 w-full h-full pb-32">
        <Hero />
        <TakeControlInput />
      </div>
    </main>
  );
}
