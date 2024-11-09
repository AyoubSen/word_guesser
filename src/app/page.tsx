"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const [userName, setUserName] = useState<string>("");
  const [isEditable, setIsEditable] = useState<boolean>(true);

  const startGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (userName) {
      router.push(`/game/5?userName=${encodeURIComponent(userName)}`);
    } else {
      alert("Please save your username before starting the game.");
    }
  };

  const saveUserName = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements[0] as HTMLInputElement).value;
    setUserName(name);
    setIsEditable(false);
  };

  const enableEditMode = () => {
    setIsEditable(true);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#DFF2EB] flex-col gap-6">
      <div className="text-3xl font-bold">Welcome to Guess the word!</div>
      {userName && <div className="text-2xl">Hello, {userName}</div>}
      <div>
        {isEditable ? (
          <form onSubmit={saveUserName}>
            <input
              type="text"
              placeholder="Enter your name"
              className="p-3 rounded"
              defaultValue={userName}
              disabled={!isEditable}
            />
            <button className="bg-[#7AB2D3] p-3 rounded text-white font-bold hover:bg-[#61a2c9] ml-5">
              Save Name
            </button>
          </form>
        ) : (
          <button
            onClick={enableEditMode}
            className="bg-[#7AB2D3] p-3 rounded text-white font-bold hover:bg-[#61a2c9]"
          >
            Edit Name
          </button>
        )}
      </div>
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
