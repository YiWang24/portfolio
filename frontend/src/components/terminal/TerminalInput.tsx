'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTypewriter } from '../../hooks/useTypewriter';

interface TerminalInputProps {
  onSend: (msg: string) => void;
  isStreaming: boolean;
  onFocusChange?: (focused: boolean) => void;
}

export interface TerminalInputRef {
  focus: () => void;
}

export const TerminalInput = forwardRef<TerminalInputRef, TerminalInputProps>(
  ({ onSend, isStreaming, onFocusChange }, ref) => {
    const [input, setInput] = useState('');
    const internalInputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [cursorLeft, setCursorLeft] = useState(0);

    // 暴露 focus 方法给父组件
    useImperativeHandle(ref, () => ({
      focus: () => {
        internalInputRef.current?.focus();
      }
    }));

    // 自然语言建议列表
    const suggestions = [
      'Tell me about your experience',
      'What projects have you built?',
      'How do I contact you?',
      'What tech stack do you use?',
      'Show me your GitHub stats',
      'What are your skills?',
      'Tell me about yourself',
    ];

    // 调用 Hook 获取当前应该显示的打字动画文本
    const ghostText = useTypewriter(suggestions, 100, 50, 2000);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isStreaming) return;
      onSend(input);
      setInput('');
      setCursorLeft(0);
    };

    // 处理焦点变化
    const handleFocus = () => {
      setIsFocused(true);
      onFocusChange?.(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
      onFocusChange?.(false);
    };

    // 计算光标位置
    const updateCursorPosition = () => {
      if (!internalInputRef.current) return;

      // 使用 canvas 测量文本宽度
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;

      const styles = window.getComputedStyle(internalInputRef.current);
      context.font = `${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;

      // 测量文本宽度
      const textWidth = context.measureText(input).width;
      setCursorLeft(textWidth);
    };

    // 当输入内容变化时，更新光标位置
    useEffect(() => {
      updateCursorPosition();
    }, [input]);

    // 自动聚焦 - 使用双重RAF确保DOM完全更新
    useEffect(() => {
      if (!isStreaming && internalInputRef.current) {
        const rafId = requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            internalInputRef.current?.focus();
          });
        });
        return () => cancelAnimationFrame(rafId);
      }
    }, [isStreaming]);

    return (
      <form onSubmit={handleSubmit} className="cli-input-line-wrapper">
        {/* Prompt 提示符 */}
        <div className="cli-prompt-arrow">➜</div>
        <div className="cli-prompt-path">~</div>

        <div className="cli-input-container">
          {/* === Layer 1: Ghost Typewriter (幽灵层) === */}
          {input === '' && !isStreaming && (
            <div className="cli-ghost-text">
              <span>{ghostText}</span>
              <span className="cli-ghost-cursor">▋</span>
            </div>
          )}

          {/* === Layer 2: Real Input (真实交互层) === */}
          <input
            ref={internalInputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="cli-real-input"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={isStreaming}
          />

          {/* Block Cursor - 始终显示（只要聚焦且不在流式输出） */}
          {isFocused && !isStreaming && (
            <div
              className="cli-block-cursor"
              style={{ left: `${cursorLeft}px` }}
            />
          )}
        </div>
      </form>
    );
  }
);

TerminalInput.displayName = 'TerminalInput';
