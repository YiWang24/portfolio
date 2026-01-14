'use client';

import { useState, useEffect } from 'react';
import { GitBranch, Wifi, Database, Globe, Zap } from 'lucide-react';

export function StatusBar({ isInputFocused }: { isInputFocused: boolean }) {
  const [time, setTime] = useState('');
  const [latency, setLatency] = useState(24);

  // 1. 实时时间
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. 模拟延迟波动 (让界面看起来是活的)
  useEffect(() => {
    const ping = setInterval(() => {
      setLatency(20 + Math.floor(Math.random() * 15));
    }, 2000);
    return () => clearInterval(ping);
  }, []);

  return (
    <div className="cli-powerline-statusbar">
      {/* --- LEFT SECTION: MODE & GIT --- */}

      {/* 1. VIM MODE: 聚焦时变色 */}
      <div className={`
        cli-powerline-mode
        ${isInputFocused ? 'bg-yellow-500' : 'bg-emerald-500'}
      `}>
        {isInputFocused ? 'INSERT' : 'NORMAL'}
      </div>

      {/* Arrow: Mode -> Git */}
      <div className={`cli-powerline-arrow ${isInputFocused ? 'bg-yellow-500' : 'bg-emerald-500'}`}></div>

      {/* 2. GIT BRANCH */}
      <div className="cli-powerline-section cli-powerline-git">
        <GitBranch size={10} />
        <span>main</span>
      </div>

      {/* Arrow: Git -> Background */}
      <div className="cli-powerline-arrow bg-[#2f334d]"></div>


      {/* --- CENTER SECTION: AGENT METRICS --- */}
      <div className="cli-powerline-center">

        {/* Model Info */}
        <div className="cli-powerline-metric hidden md:flex">
          <Database size={10} />
          <span>Gemini-Pro</span>
        </div>

        {/* RAG Status */}
        <div className="cli-powerline-metric">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>RAG Active</span>
        </div>

        {/* Latency (Dynamic) */}
        <div className="cli-powerline-metric w-16 justify-end hidden sm:flex">
          <Zap size={10} className={latency > 30 ? 'text-yellow-500' : 'text-emerald-500'} />
          <span>{latency}ms</span>
        </div>
      </div>


      {/* --- RIGHT SECTION: ENV & TIME --- */}

      {/* Location */}
      <div className="cli-powerline-section cli-powerline-location">
        <Globe size={10} />
        <span className="hidden sm:inline">Canada</span>
      </div>

      {/* Arrow: Location -> Time */}
      <div className="cli-powerline-arrow bg-[#2f334d]"></div>

      {/* Time */}
      <div className="cli-powerline-time">
         {time}
      </div>

    </div>
  );
}
