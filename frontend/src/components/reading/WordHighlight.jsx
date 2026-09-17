"use client";

import { motion } from "framer-motion";

export default function WordHighlight({ word, isVocabulary, onClick }) {
  if (!isVocabulary) {
    return <span>{word} </span>;
  }

  return (
    <motion.span
      whileHover={{ scale: 1.1, backgroundColor: "rgba(251, 191, 36, 0.4)" }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(word)}
      style={{
        cursor: "pointer",
        borderRadius: "4px",
        padding: "0 4px",
        margin: "0 -2px",
        backgroundColor: "rgba(251, 191, 36, 0.15)", // Subtle gold highlight
        borderBottom: "2px dashed #fbbf24", // Gold underline
        color: "#fbbf24",
        display: "inline-block",
        transition: "color 0.2s",
      }}
    >
      {word}
    </motion.span>
  );
}
