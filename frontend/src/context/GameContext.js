"use client";

import { createContext, useContext, useState } from 'react';
import api from '@/lib/api';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [activeSession, setActiveSession] = useState(null);
  const [currentNode, setCurrentNode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Start a new adaptive game session
  const startSession = async (theme = "The Lantern Isles") => {
    setIsLoading(true);
    try {
      const response = await api.post('/api/stories/start', { theme });
      setActiveSession({
        id: response.data.session_id,
        difficulty: response.data.difficulty,
        theme: theme,
        score: 0,
        progress: 1
      });
      setCurrentNode({
        id: response.data.node_id,
        passage_text: response.data.passage_text,
        vocabulary_words: response.data.vocabulary_words,
        branch_choices: response.data.branch_choices,
        challenge_data: response.data.challenge_data,
      });
    } catch (e) {
      console.error("Failed to start session", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Record a challenge result to update adaptive metrics and fetch the next branch
  const makeChoice = async (choiceId, challengeCorrect, skillTested) => {
    if (!activeSession || !currentNode) return;
    
    setIsGenerating(true);
    try {
      const response = await api.post(`/api/stories/${activeSession.id}/branch`, {
        current_node_id: currentNode.id,
        choice_id: choiceId,
        challenge_correct: challengeCorrect,
        skill_tested: skillTested
      });
      
      setActiveSession(prev => ({
        ...prev,
        score: prev.score + (challengeCorrect ? 10 : 0),
        progress: prev.progress + 1,
        difficulty: response.data.difficulty
      }));

      setCurrentNode({
        id: response.data.node_id,
        passage_text: response.data.passage_text,
        vocabulary_words: response.data.vocabulary_words,
        branch_choices: response.data.branch_choices,
        challenge_data: response.data.challenge_data,
      });
    } catch (e) {
      console.error("Failed to generate branch", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const endSession = () => {
    setActiveSession(null);
    setCurrentNode(null);
  };

  return (
    <GameContext.Provider value={{
      activeSession,
      currentNode,
      isLoading,
      isGenerating,
      startSession,
      makeChoice,
      endSession
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
