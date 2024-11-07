"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const startGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (router) {
      router.push(`/game/5`);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#DFF2EB] flex-col gap-6">
      <div className="text-5xl font-bold">Welcome to Guess the word!</div>
      <form onSubmit={startGame}>
        <button
          type="submit"
          className="bg-[#7AB2D3] p-3 rounded text-white font-bold hover:bg-[#61a2c9]"
        >
          Start a game
        </button>
      </form>
    </div>
  );
}
