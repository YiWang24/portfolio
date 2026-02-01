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

// Supported commands
const SUPPORTED_COMMANDS = [
  'ls', 'll',
  'cat', 'cd',
  'whoami',
  'date',
  'sudo',
  'rm',
  'vi', 'vim', 'nano',
  'clear',
  'uname',
  'help',
  'matrix'
];

// Natural language suggestions (moved outside the component to avoid duplicate creation)
const SUGGESTIONS = [
  'Tell me about your experience',
  'What projects have you built?',
  'How do I contact you?',
  'What tech stack do you use?',
  'Show me your GitHub stats',
  'What are your skills?',
  'Tell me about yourself',
];

export const TerminalInput = forwardRef<TerminalInputRef, TerminalInputProps>(
  ({ onSend, isStreaming, onFocusChange }, ref) => {
    const [input, setInput] = useState('');
    const internalInputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [cursorLeft, setCursorLeft] = useState(0);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [matchedCommands, setMatchedCommands] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    // Expose focus method to parent component
    useImperativeHandle(ref, () => ({
      focus: () => {
        internalInputRef.current?.focus();
      }
    }));

    // Natural language suggestions
    const suggestions = [
      'Tell me about your experience',
      'What projects have you built?',
      'How do I contact you?',
      'What tech stack do you use?',
      'Show me your GitHub stats',
      'What are your skills?',
      'Tell me about yourself',
    ];

    // Call Hook to get the current text to display with typewriter effect
    const ghostText = useTypewriter(SUGGESTIONS, 100, 50, 2000);

    // Detect if the input starts with a supported command
    const getCommandMatch = (text: string) => {
      const trimmed = text.trim();
      const parts = trimmed.split(' ');
      const command = parts[0].toLowerCase();

      for (const supportedCmd of SUPPORTED_COMMANDS) {
        if (command === supportedCmd) {
          return {
            command: command,
            length: command.length,
            args: trimmed.slice(command.length).trimStart()
          };
        }
      }
      return null;
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isStreaming) return;
      onSend(input);
      setInput('');
      setCursorLeft(0);
    };

    // Handle keyboard events - Tab key for auto-completion and switching suggestions
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();

        if (!input.trim() || isStreaming) return;

        const trimmed = input.trim();
        const parts = trimmed.split(' ');

        // Only auto-complete commands when entering the first word
        if (parts.length === 1) {
          const partial = parts[0].toLowerCase();

          // Find matching commands
          const matches = SUPPORTED_COMMANDS.filter(cmd => cmd.startsWith(partial));

          if (matches.length === 1) {
            // Only one match, auto-complete directly
            setInput(matches[0] + ' ');
            setShowSuggestions(false);
            setSelectedIndex(-1);
          } else if (matches.length > 1) {
            // Multiple matches
            if (!showSuggestions) {
              // First press Tab: display suggestions, complete to common prefix
              setMatchedCommands(matches);
              setShowSuggestions(true);
              setSelectedIndex(0);

              // Complete to longest common prefix
              const firstMatch = matches[0];
              let commonPrefix = firstMatch;

              for (let i = 1; i < matches.length; i++) {
                while (commonPrefix && !matches[i].startsWith(commonPrefix)) {
                  commonPrefix = commonPrefix.slice(0, -1);
                }
              }

              if (commonPrefix && commonPrefix.length > partial.length) {
                setInput(commonPrefix);
              }
            } else {
              // Already displaying suggestions, Tab key switches to the next suggestion
              setSelectedIndex(prev => (prev + 1) % matchedCommands.length);
            }
          }
        }
      } else if (e.key === 'Escape') {
        // ESC key hides suggestions
        setShowSuggestions(false);
        setSelectedIndex(-1);
      } else if (showSuggestions && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        // Up and down arrows select commands
        e.preventDefault();

        if (e.key === 'ArrowUp') {
          setSelectedIndex(prev => prev > 0 ? prev - 1 : matchedCommands.length - 1);
        } else {
          setSelectedIndex(prev => prev < matchedCommands.length - 1 ? prev + 1 : 0);
        }
      } else if (showSuggestions && e.key === 'Enter') {
        // If suggestions are displayed and an item is selected, use the selected command
        e.preventDefault();
        setInput(matchedCommands[selectedIndex] + ' ');
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };


    // Hide suggestions
    const hideSuggestions = () => {
      // Delay hiding to allow click events to trigger first
      setTimeout(() => {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }, 200);
    };

    // Handle focus change
    const handleFocus = () => {
      setIsFocused(true);
      onFocusChange?.(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
      onFocusChange?.(false);
      hideSuggestions();
    };

    // When input changes, hide suggestions
    useEffect(() => {
      if (input.includes(' ')) {
        // Inputted a space, indicating parameters have started, hide suggestions
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }, [input]);

    // Calculate cursor position
    const updateCursorPosition = () => {
      if (!internalInputRef.current) return;

      // Use canvas to measure text width
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;

      const styles = window.getComputedStyle(internalInputRef.current);
      context.font = `${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;

      // Measure text width
      const textWidth = context.measureText(input).width;
      setCursorLeft(textWidth);
    };

    // When input changes, update cursor position
    useEffect(() => {
      updateCursorPosition();
    }, [input]);

    // Auto-focus - Use double RAF to ensure DOM is fully updated
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

    // Render highlighted input text
    const renderHighlightedText = () => {
      if (!input) return null;

      const match = getCommandMatch(input);

      if (match) {
        // Command matched, use highlight color for command part
        return (
          <div className="cli-input-highlight">
            <span className="cli-command-highlight">{match.command}</span>
            <span className="cli-args-text">{input.slice(match.command.length)}</span>
          </div>
        );
      }

      //  No command matched, display normally
      return (
        <div className="cli-input-highlight">
          <span className="cli-normal-text">{input}</span>
        </div>
      );
    };

    return (
      <div className="cli-input-section">
        <form onSubmit={handleSubmit} className="cli-input-line-wrapper">
          {/* Prompt */}
          <div className="cli-prompt-arrow">➜</div>
          <div className="cli-prompt-path">~</div>

          <div className="cli-input-wrapper">
            <div className="cli-input-container">
              {/* === Layer 1: Ghost Typewriter (Ghost Layer) === */}
              {input === '' && !isStreaming && (
                <div className="cli-ghost-text">
                  <span>{ghostText}</span>
                  <span className="cli-ghost-cursor">▋</span>
                </div>
              )}

              {/* === Layer 2: Highlighted Text (Highlighted Text Layer) === */}
              {input && renderHighlightedText()}

              {/* === Layer 3: Real Input (Real Input Layer) === */}
              <input
                ref={internalInputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="cli-real-input"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                disabled={isStreaming}
              />

              {/* Block Cursor - Always displayed (as long as focused and not streaming) */}
              {isFocused && !isStreaming && (
                <div
                  className="cli-block-cursor"
                  style={{ left: `${cursorLeft}px` }}
                />
              )}
            </div>
          </div>
        </form>

        {/* === Command Suggestions (Command Suggestions) === */}
        {showSuggestions && matchedCommands.length > 1 && (
          <div className="cli-command-suggestions-inline">
            {matchedCommands.map((cmd, index) => (
              <span
                key={cmd}
                className={`cli-suggestion-inline ${index === selectedIndex ? 'selected' : ''}`}
              >
                {cmd}
                {index < matchedCommands.length - 1 && '  '}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }
);

TerminalInput.displayName = 'TerminalInput';
