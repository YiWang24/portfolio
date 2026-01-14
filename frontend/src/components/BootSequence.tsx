"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BootSequenceProps {
  onComplete: () => void;
  duration?: number;
}

const bootLogs = [
  "Last login: Tue Jan 13 11:42:05 on ttys001",
  "[boot]    Initializing Spring Boot kernel (v3.2.0)...",
  '[memory]  Allocating Heap for "Yi_Wang_Resume.pdf"... [OK]',
  "[db]      Connecting to Vector Store (Pinecone/Milvus)... [OK]",
  "[rag]     Indexing knowledge base chunks... [DONE]",
  "[net]     Handshaking with GitHub GraphQL API... [200 OK]",
  "[auth]    Security protocols active. Sandbox mode: ON.",
  "[success] System online. Latency: 12ms.",
];

export default function BootSequence({
  onComplete,
  duration = 1500,
}: BootSequenceProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [phase, setPhase] = useState<"logs" | "logo" | "exit">("logs");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < bootLogs.length) {
        setLogs((prev) => [...prev, bootLogs[index]]);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => setPhase("logo"), 200);
        setTimeout(() => setPhase("exit"), duration);
        setTimeout(() => onComplete(), duration + 300);
      }
    }, 180);

    return () => clearInterval(interval);
  }, [onComplete, duration]);

  return (
    <AnimatePresence mode="wait">
      {phase !== "exit" && (
        <motion.div
          key="boot-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 min-h-screen bg-void flex items-center justify-center"
        >
          <div className="w-full max-w-lg p-8">
            <AnimatePresence mode="wait">
              {phase === "logs" && (
                <motion.div
                  key="logs"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="font-mono text-sm space-y-1"
                >
                  {logs.map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                      className="text-neon-green"
                    >
                      {log}
                    </motion.div>
                  ))}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                    className="inline-block w-2 h-4 bg-neon-green ml-1"
                  />
                </motion.div>
              )}

              {phase === "logo" && (
                <motion.div
                  key="logo"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="text-center"
                >
                  <motion.div
                    className="text-6xl font-bold text-neon-green mb-4"
                    style={{
                      textShadow:
                        "0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    DT
                  </motion.div>
                  <div className="text-text-muted text-sm font-mono">
                    DIGITAL TWIN ONLINE
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
