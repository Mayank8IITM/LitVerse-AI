"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import confetti from "canvas-confetti";

export default function ReadAloudChallenge({ textToRead, onComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [feedback, setFeedback] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await handleUpload(audioBlob);
        
        // Stop all tracks to turn off the microphone light
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTranscription("");
      setFeedback(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Please allow microphone access to use this feature.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUpload = async (audioBlob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');

    try {
      const response = await api.post('/api/coach/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const text = response.data.text;
      setTranscription(text);
      
      // Simple verification: if the transcription contains key words from the text
      const cleanExpected = textToRead.toLowerCase().replace(/[^\w\s]/gi, '');
      const cleanHeard = text.toLowerCase().replace(/[^\w\s]/gi, '');
      
      const expectedWords = cleanExpected.split(' ').filter(w => w.length > 2);
      let matches = 0;
      expectedWords.forEach(word => {
        if (cleanHeard.includes(word)) matches++;
      });
      
      const matchPercentage = expectedWords.length > 0 ? (matches / expectedWords.length) : 0;
      
      if (matchPercentage > 0.6) {
        setFeedback("Great job! You read that perfectly.");
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#059669']
        });
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 2000);
      } else {
        setFeedback("I didn't quite catch that. Try speaking a bit louder and clearer!");
      }
      
    } catch (error) {
      console.error("Transcription failed", error);
      setFeedback("Oops, there was an error analyzing your voice.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        backgroundColor: '#1e293b',
        padding: '2rem',
        borderRadius: '12px',
        borderTop: '4px solid #10b981',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
        width: '100%',
        textAlign: 'center'
      }}
    >
      <h3 style={{ fontFamily: 'var(--font-outfit), sans-serif', color: '#f8fafc', marginBottom: '1rem' }}>
        Read Aloud Challenge 🎙️
      </h3>
      <p style={{ fontFamily: 'var(--font-inter), sans-serif', color: '#cbd5e1', marginBottom: '1.5rem' }}>
        Click the microphone and read this sentence out loud:
      </p>
      
      <div style={{ 
        backgroundColor: '#0f172a', 
        padding: '1.5rem', 
        borderRadius: '8px',
        fontSize: '1.25rem',
        fontFamily: 'var(--font-literata), serif',
        color: '#fbbf24',
        marginBottom: '2rem'
      }}>
        "{textToRead}"
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center', flexDirection: 'column' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: isRecording ? '#ef4444' : (isProcessing ? '#64748b' : '#10b981'),
            border: 'none',
            color: 'white',
            fontSize: '2rem',
            cursor: isProcessing ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isRecording ? '0 0 20px rgba(239, 68, 68, 0.6)' : '0 4px 6px rgba(0,0,0,0.2)'
          }}
        >
          {isProcessing ? '⏳' : (isRecording ? '⏹' : '🎤')}
        </motion.button>
        
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          {isRecording ? "Listening... click to stop" : (isProcessing ? "Pip is thinking..." : "Click to start recording")}
        </p>

        {transcription && (
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#334155', borderRadius: '8px', width: '100%' }}>
            <p style={{ color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Pip heard:</p>
            <p style={{ color: '#f8fafc', fontStyle: 'italic' }}>"{transcription}"</p>
            {feedback && (
              <p style={{ 
                marginTop: '1rem', 
                color: feedback.includes("Great") ? '#10b981' : '#fbbf24',
                fontWeight: 'bold'
              }}>
                {feedback}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
