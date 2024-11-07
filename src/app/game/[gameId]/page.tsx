"use client";
import { useState, useCallback, useEffect } from "react";
import dictionaryJson from "../../../assets/words_dictionary.json";

const dictionary = dictionaryJson as unknown as Dictionary;

interface Dictionary {
  [word: string]: boolean;
}

export default function Home() {
  const [currentword, setCurrentWord] = useState<string>("");
  const [randomString, setRandomString] = useState<string>("");
  const [resultString, setResultString] = useState<string>("");

  const pickRandomStr = () => {
    const keys = Object.keys(dictionary);
    const randomWord = keys[Math.floor(Math.random() * keys.length)];

    if (randomWord.length >= 3) {
      const startIdx = Math.floor(Math.random() * (randomWord.length - 2));
      const randomSubstring = randomWord.substring(startIdx, startIdx + 3);
      setRandomString(randomSubstring);
    } else {
      setRandomString(randomWord);
    }
  };

  useEffect(() => {
    pickRandomStr();
  }, []);

  const submitWord = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (dictionary[currentword] && currentword.includes(randomString)) {
        setResultString("Word exists!");
        setCurrentWord("");
        pickRandomStr();
      } else {
        setResultString("Try again!");
      }
    },
    [currentword, randomString]
  );

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#DFF2EB] font-sans">
      <h1 className="text-4xl mb-8 text-gray-800 font-bold">Word Game</h1>
      <div className="text-5xl font-bold text-blue-500 mb-8 pb-5 p-3 rounded-lg bg-white shadow-lg">
        {randomString}
      </div>
      <form
        onSubmit={submitWord}
        className="flex flex-col items-center w-full max-w-md"
      >
        <input
          className="p-3 text-lg w-full mb-4 rounded border-2 border-gray-300 focus:outline-none"
          type="text"
          value={currentword}
          onChange={(event) => setCurrentWord(event.target.value)}
          placeholder="Enter a word containing the above letters"
        />
        <div className="flex justify-between w-full">
          <button
            type="submit"
            className="p-3 bg-green-500 text-white font-bold rounded transition duration-300 hover:bg-green-600"
          >
            Submit
          </button>
          <button
            type="button"
            className="p-3 bg-red-500 text-white font-bold rounded transition duration-300 hover:bg-red-600"
            onClick={() => {
              setResultString("");
              setCurrentWord("");
              pickRandomStr();
            }}
          >
            Reset
          </button>
        </div>
      </form>
      {resultString && (
        <p className="mt-8 text-2xl font-bold text-gray-800">{resultString}</p>
      )}
    </div>
  );
}