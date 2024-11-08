"use client";
import { useState, useCallback, useEffect } from "react";
import dictionaryJson from "../../../assets/words_dictionary.json";
import { io } from "socket.io-client";

const dictionary = dictionaryJson as unknown as Dictionary;

interface Dictionary {
  [word: string]: boolean;
}

let socket: any;

export default function Home({ params }: { params: { gameId: string } }) {
  const id = params.gameId; // Extract room ID from the URL

  const [currentword, setCurrentWord] = useState<string>("");
  const [randomString, setRandomString] = useState<string>("");
  const [resultString, setResultString] = useState<string>("");
  const [userCount, setUserCount] = useState<number>(0);

  useEffect(() => {
    if (!id) return;
    socket = io("http://localhost:8000");

    socket.on("connect", () => {
      console.log("Connected to socket server");
      socket.emit("joinRoom", id);
    });

    socket.on("userCount", (count: number) => {
      setUserCount(count);
    });

    socket.on("randomString", (sharedString: string) => {
      setRandomString(sharedString);
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const submitWord = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (dictionary[currentword] && currentword.includes(randomString)) {
        setResultString("Word exists!");
        setCurrentWord("");

        // Emit the  to inform the server of the correct answer
        socket.emit("correctAnswer", id);
      } else {
        setResultString("Try again!");
      }
    },
    [currentword, randomString, id]
  );

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#DFF2EB] font-sans">
      <h1 className="text-4xl mb-8 text-gray-800 font-bold">Word Game</h1>
      <div>User count: {userCount}</div>
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
