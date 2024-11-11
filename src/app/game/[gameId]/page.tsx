"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { io } from "socket.io-client";
import dictionaryJson from "@/assets/words_dictionary.json";
let socket: any;

interface Dictionary {
  [word: string]: boolean;
}

interface User {
  userName: string;
  score: number;
  lives: number;
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
  const [users, setUsers] = useState<User[]>([]);
  const [timer, setTimer] = useState<number>(10);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const defaultTimer: number = 10;

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
      if (!gameOver && gameStarted) {
        setRandomString(sharedString);
        setTimer(defaultTimer);

        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
        timerIntervalRef.current = setInterval(() => {
          setTimer((prev) => {
            if (prev < 1) {
              clearInterval(timerIntervalRef.current!);
              timerIntervalRef.current = null;
              socket.emit("timeOver", { roomId: id });
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    });

    socket.on("userList", (userList: User[]) => {
      setUsers(userList);
    });

    socket.on("forbidden", (message: string) => {
      setResultString(message);
      setGameOver(true);
      stopTimer();
      setRandomString("");
    });

    socket.on("gameOver", (message: string) => {
      setGameOver(true);
      setResultString(message);
      stopTimer();
      setRandomString("");

      if (message.startsWith("Game Over. Winner:")) {
        const winnerName = message.split(": ")[1];
        setWinner(winnerName);
      }
    });

    socket.on("gameStarted", () => {
      setGameStarted(true);
      setResultString("The game has started!");
    });

    socket.on("gameError", (message: string) => {
      setResultString(message);
    });

    socket.on("pauseTimerForAll", () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        setIsTimerRunning(false);
      }
    });

    socket.on("resumeTimerForAll", () => {
      if (!timerIntervalRef.current) {
        timerIntervalRef.current = setInterval(() => {
          setTimer((prev) => {
            if (prev < 1) {
              clearInterval(timerIntervalRef.current!);
              timerIntervalRef.current = null;
              socket.emit("timeOver", { roomId: id });
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        setIsTimerRunning(true);
      }
    });

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      socket.disconnect();
    };
  }, [id, userName, gameOver, gameStarted]);

  const startGame = () => {
    socket.emit("startGame", { roomId: id });
  };

  const submitWord = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (gameOver) {
        setResultString("Game is over. You cannot continue.");
        return;
      }

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
    [currentword, id, gameOver, randomString]
  );

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsTimerRunning(false);
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#DFF2EB] font-sans">
      <h1 className="text-4xl mb-8 text-gray-800 font-bold">Word Game</h1>
      {!gameStarted && (
        <>
          <div className="text-lg mb-4 font-bold flex flex-col items-center">
            Connected users:
            <ul className="list-disc ml-5 font-normal">
              {users.map((user, index) => (
                <li key={index}>{user.userName}</li>
              ))}
            </ul>
          </div>
        </>
      )}
      {gameOver && winner && (
        <p className="mt-8 text-2xl font-bold text-green-600">
          Winner: {winner}
        </p>
      )}
      {gameOver && (
        <p className="mt-8 text-2xl font-bold text-red-600">Game Over</p>
      )}
      {!gameStarted ? (
        <button
          onClick={startGame}
          className={`p-3 bg-blue-500 text-white font-bold rounded mt-4 transition duration-300 hover:bg-blue-600 ${
            userCount > 1 ? "" : "cursor-not-allowed opacity-50"
          }`}
          disabled={userCount <= 1}
        >
          Start Game
        </button>
      ) : (
        <>
          <div>User count: {userCount}</div>
          <div className="text-lg mb-4 text-center font-bold">
            Connected users:
            <ul className="list-disc ml-5">
              {users.map((user, index) => (
                <li key={index}>
                  {user.userName} - Score: {user.score} - Lives: {user.lives}
                </li>
              ))}
            </ul>
          </div>
          {!gameOver && (
            <div className="text-5xl font-bold text-blue-500 mb-8 pb-5 p-3 rounded-lg bg-white shadow-lg">
              {randomString}
            </div>
          )}
          {!gameOver && (
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
                disabled={gameOver || !isTimerRunning}
              />
              <div className="flex justify-center w-full">
                <button
                  type="submit"
                  className={`p-3 bg-green-500 text-white font-bold rounded transition duration-300 hover:bg-green-600 ${
                    gameOver || !isTimerRunning ? "cursor-not-allowed " : ""
                  }`}
                  disabled={gameOver || !isTimerRunning}
                >
                  Submit
                </button>
              </div>
            </form>
          )}
          <div className="flex flex-col gap-5">
            {!gameOver && (
              <p className="mt-8 text-2xl font-bold text-gray-800">
                Time left: {timer} seconds
              </p>
            )}
            {!gameOver && (
              <button
                onClick={() => {
                  if (isTimerRunning) {
                    stopTimer();
                    socket.emit("pauseTimer", { roomId: id });
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
                    setIsTimerRunning(true);
                    socket.emit("resumeTimer", { roomId: id });
                  }
                }}
                className={`p-3 font-bold rounded transition duration-300 ${
                  isTimerRunning
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {isTimerRunning ? "Pause Timer" : "Resume Timer"}
              </button>
            )}
          </div>
          {resultString && (
            <p className="mt-8 text-2xl font-bold text-gray-800">
              {resultString}
            </p>
          )}
        </>
      )}
      {gameOver && (
        <button
          onClick={() => {
            window.location.reload();
          }}
          className="p-3 bg-purple-500 text-white font-bold rounded mt-4 transition duration-300 hover:bg-purple-600"
        >
          Play Again
        </button>
      )}
    </div>
  );
}
