"use client";
import { useState, useCallback, useEffect } from "react";
import dictionaryJson from "../assets/words_dictionary.json";

const dictionary = dictionaryJson as unknown as Dictionary;

interface Dictionary {
  [word: string]: boolean;
}

interface Styles {
  [key: string]: string;
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
        setResultString("Word exists");
        setCurrentWord("");
        pickRandomStr();
      } else {
        setResultString("Dumbass");
      }
    },
    [currentword, randomString]
  );

  const inputStyles: Styles = {
    padding: "10px",
    marginTop: "50px",
    fontSize: "1.5rem",
    boxShadow: "0 0 0 1px black",
  };

  const pageStyles: Styles = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  };
  return (
    <div style={pageStyles}>
      <h1 style={{ marginBottom: "50px" }}>{resultString}</h1>
      <h1>{randomString}</h1>
      <form onSubmit={submitWord}>
        <input
          style={inputStyles}
          type="text"
          value={currentword}
          onChange={(event) => {
            setCurrentWord(event.target.value);
          }}
        />
        <input
          style={{
            background: "gray",
            padding: "15px",
            marginLeft: "20px",
            color: "white",
          }}
          type="submit"
          value="Submit"
        />
        <button
          type="button"
          style={{
            background: "gray",
            padding: "15px",
            marginLeft: "20px",
            color: "white",
          }}
          onClick={() => {
            setResultString("");
            setCurrentWord("");
            pickRandomStr();
          }}
        >
          I&apos;m a dumbass
        </button>
      </form>
    </div>
  );
}
