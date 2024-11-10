"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { io } from "socket.io-client";
import dictionaryJson from "@/assets/words_dictionary.json";
let socket: any;

interface Dictionary {
  [word: string]: boolean;
}

const dictionary = dictionaryJson as unknown as Dictionary;

export default function Home({ params }: { params: { gameId: string } }) {
  const id = params.gameId;
  const searchParams = useSearchParams();
  const userName = searchParams.get("userName") || "Anonymous";

  const [currentword, setCurrentWord] = useState<string>("");
  const [randomString, setRandomString] = useState<string>("");
  const [resultString, setResultString] = useState<string>("");
  const [userCount, setUserCount] = useState<number>(0);
  const [users, setUsers] = useState<string[]>([]);
  const [timer, setTimer] = useState<number>(10);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!id) return;

    socket = io("http://localhost:8000");

    socket.on("connect", () => {
      console.log("Connected to socket server");
      socket.emit("joinRoom", { roomId: id, userName });
    });

    socket.on("userCount", (count: number) => {
      setUserCount(count);
    });

    socket.on("randomString", (sharedString: string) => {
      setRandomString(sharedString);
      setTimer(10);

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev < 1) {
            clearInterval(timerIntervalRef.current!);
            socket.emit("timeOver", { roomId: id });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    socket.on("userList", (userList: string[]) => {
      setUsers(userList);
    });

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      socket.disconnect();
    };
  }, [id, userName]);

  const submitWord = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!currentword) {
        setResultString("Please enter a word!");
        return;
      }

      if (dictionary[currentword] && currentword.includes(randomString)) {
        socket.emit("correctAnswerAttempt", {
          roomId: id,
          submittedWord: currentword,
        });
        setResultString("Word exists!");
        setCurrentWord("");
      } else {
        setResultString("Try again!");
      }
    },
    [currentword, id]
  );

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#DFF2EB] font-sans">
      <h1 className="text-4xl mb-8 text-gray-800 font-bold">Word Game</h1>
      <div>User count: {userCount}</div>
      <div className="text-lg mb-4">Connected users: {users.join(", ")}</div>
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
      <div className="flex flex-col gap-5">
        <p className="mt-8 text-2xl font-bold text-gray-800">
          Time left: {timer} seconds
        </p>
        <button
          onClick={() => {
            if (isTimerRunning) {
              if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
              }
            } else {
              timerIntervalRef.current = setInterval(() => {
                setTimer((prev) => {
                  if (prev < 1) {
                    clearInterval(timerIntervalRef.current!);
                    socket.emit("timeOver", { roomId: id });
                    return 0;
                  }
                  return prev - 1;
                });
              }, 1000);
            }
            setIsTimerRunning(!isTimerRunning);
          }}
          className={`p-3 font-bold rounded transition duration-300 ${
            isTimerRunning
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {isTimerRunning ? "Pause Timer" : "Resume Timer"}
        </button>
      </div>
      {resultString && (
        <p className="mt-8 text-2xl font-bold text-gray-800">{resultString}</p>
      )}
    </div>
  );
}
