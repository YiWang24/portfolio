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

// 支持的命令列表
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
  'help'
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

    // 检测输入是否以支持的命令开头
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

    // 处理键盘事件 - Tab 键自动补全和切换建议
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();

        if (!input.trim() || isStreaming) return;

        const trimmed = input.trim();
        const parts = trimmed.split(' ');

        // 只在输入第一个单词时自动补全命令
        if (parts.length === 1) {
          const partial = parts[0].toLowerCase();

          // 查找匹配的命令
          const matches = SUPPORTED_COMMANDS.filter(cmd => cmd.startsWith(partial));

          if (matches.length === 1) {
            // 只有一个匹配，直接补全
            setInput(matches[0] + ' ');
            setShowSuggestions(false);
            setSelectedIndex(-1);
          } else if (matches.length > 1) {
            // 多个匹配
            if (!showSuggestions) {
              // 首次按 Tab：显示建议列表，补全到公共前缀
              setMatchedCommands(matches);
              setShowSuggestions(true);
              setSelectedIndex(0);

              // 补全到最长公共前缀
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
              // 已经显示建议，Tab 键切换到下一个建议
              setSelectedIndex(prev => (prev + 1) % matchedCommands.length);
            }
          }
        }
      } else if (e.key === 'Escape') {
        // ESC 键隐藏建议列表
        setShowSuggestions(false);
        setSelectedIndex(-1);
      } else if (showSuggestions && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        // 上下箭头选择命令
        e.preventDefault();

        if (e.key === 'ArrowUp') {
          setSelectedIndex(prev => prev > 0 ? prev - 1 : matchedCommands.length - 1);
        } else {
          setSelectedIndex(prev => prev < matchedCommands.length - 1 ? prev + 1 : 0);
        }
      } else if (showSuggestions && e.key === 'Enter') {
        // 如果显示建议且选中了某项，使用选中的命令
        e.preventDefault();
        setInput(matchedCommands[selectedIndex] + ' ');
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    // 选择建议的命令
    const selectSuggestion = (cmd: string) => {
      setInput(cmd + ' ');
      setShowSuggestions(false);
      setSelectedIndex(-1);
      internalInputRef.current?.focus();
    };

    // 隐藏建议列表
    const hideSuggestions = () => {
      // 延迟隐藏，以便点击事件能先触发
      setTimeout(() => {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }, 200);
    };

    // 处理焦点变化
    const handleFocus = () => {
      setIsFocused(true);
      onFocusChange?.(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
      onFocusChange?.(false);
      hideSuggestions();
    };

    // 当输入变化时，隐藏建议列表
    useEffect(() => {
      if (input.includes(' ')) {
        // 输入了空格，说明已开始输入参数，隐藏建议
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }, [input]);

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

    // 渲染高亮的输入文本
    const renderHighlightedText = () => {
      if (!input) return null;

      const match = getCommandMatch(input);

      if (match) {
        // 有命令匹配，命令部分用高亮颜色
        return (
          <div className="cli-input-highlight">
            <span className="cli-command-highlight">{match.command}</span>
            <span className="cli-args-text">{input.slice(match.command.length)}</span>
          </div>
        );
      }

      // 没有命令匹配，正常显示
      return (
        <div className="cli-input-highlight">
          <span className="cli-normal-text">{input}</span>
        </div>
      );
    };

    return (
      <div className="cli-input-section">
        <form onSubmit={handleSubmit} className="cli-input-line-wrapper">
          {/* Prompt 提示符 */}
          <div className="cli-prompt-arrow">➜</div>
          <div className="cli-prompt-path">~</div>

          <div className="cli-input-wrapper">
            <div className="cli-input-container">
              {/* === Layer 1: Ghost Typewriter (幽灵层) === */}
              {input === '' && !isStreaming && (
                <div className="cli-ghost-text">
                  <span>{ghostText}</span>
                  <span className="cli-ghost-cursor">▋</span>
                </div>
              )}

              {/* === Layer 2: Highlighted Text (高亮文本层) === */}
              {input && renderHighlightedText()}

              {/* === Layer 3: Real Input (真实交互层) === */}
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

              {/* Block Cursor - 始终显示（只要聚焦且不在流式输出） */}
              {isFocused && !isStreaming && (
                <div
                  className="cli-block-cursor"
                  style={{ left: `${cursorLeft}px` }}
                />
              )}
            </div>
          </div>
        </form>

        {/* === Command Suggestions (命令建议列表) === */}
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
