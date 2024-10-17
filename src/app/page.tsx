"use client";
import { useState, useCallback, useEffect } from "react";
import dictionaryJson from "../assets/words_dictionary.json";

const dictionary = dictionaryJson as unknown as Dictionary;

interface Dictionary {
  [word: string]: boolean;
}

interface Styles {
  [key: string]: React.CSSProperties;
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

  const styles: Styles = {
    page: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f0f4f8",
      fontFamily: "'Arial', sans-serif",
    },
    title: {
      fontSize: "2.5rem",
      marginBottom: "2rem",
      color: "#2c3e50",
    },
    randomString: {
      fontSize: "3rem",
      fontWeight: "bold",
      color: "#3498db",
      marginBottom: "2rem",
      padding: "0.5rem 1rem",
      borderRadius: "8px",
      backgroundColor: "#fff",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
      maxWidth: "400px",
    },
    input: {
      padding: "12px",
      fontSize: "1.2rem",
      width: "100%",
      marginBottom: "1rem",
      borderRadius: "4px",
      border: "2px solid #bdc3c7",
      outline: "none",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "space-between",
      width: "100%",
    },
    button: {
      padding: "12px 24px",
      fontSize: "1rem",
      fontWeight: "bold",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
    submitButton: {
      backgroundColor: "#2ecc71",
    },
    resetButton: {
      backgroundColor: "#e74c3c",
    },
    result: {
      marginTop: "2rem",
      fontSize: "1.5rem",
      fontWeight: "bold",
      color: "#2c3e50",
    },
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Word Game</h1>
      <div style={styles.randomString}>{randomString}</div>
      <form onSubmit={submitWord} style={styles.form}>
        <input
          style={styles.input}
          type="text"
          value={currentword}
          onChange={(event) => setCurrentWord(event.target.value)}
          placeholder="Enter a word containing the above letters"
        />
        <div style={styles.buttonContainer}>
          <button
            type="submit"
            style={{ ...styles.button, ...styles.submitButton }}
          >
            Submit
          </button>
          <button
            type="button"
            style={{ ...styles.button, ...styles.resetButton }}
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
      {resultString && <p style={styles.result}>{resultString}</p>}
    </div>
  );
}
