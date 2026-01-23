import React, { useState, useRef, useEffect, useCallback } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './AIChatWidget.module.css';
import { Analytics } from "@vercel/analytics/next"

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
}

interface StreamEvent {
    type: string;
    sessionId?: string;
    delta?: string;
    content?: string;
    toolId?: string;
    toolName?: string;
    arguments?: string;
    result?: string;
    success?: boolean;
    message?: string;
    code?: string;
}

export default function AIChatWidget(): JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    // Use frontend API proxy to handle Cloudflare Access authentication
    const API_PROXY_URL = (siteConfig.customFields?.frontendUrl as string) || 'https://www.yiw.me';

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Generate session ID on mount
    useEffect(() => {
        setSessionId(`docs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const sendMessage = useCallback(async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: inputValue.trim(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        // Create assistant message placeholder
        const assistantMessageId = `assistant-${Date.now()}`;
        setMessages(prev => [...prev, {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            isStreaming: true,
        }]);

        try {
            const params = new URLSearchParams({
                sessionId,
                message: userMessage.content,
            });

            const response = await fetch(`${API_PROXY_URL}/api/chat/stream?${params}`, {
                method: 'GET',
                headers: {
                    'Accept': 'text/event-stream',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('No response body');
            }

            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                let currentEvent = 'message';
                let currentData = '';

                for (const line of lines) {
                    if (line.trim() === '') {
                        // Empty line = dispatch event
                        if (currentData) {
                            try {
                                const data = JSON.parse(currentData);

                                if (currentEvent === 'response_delta' && data.content) {
                                    setMessages(prev => prev.map(msg =>
                                        msg.id === assistantMessageId
                                            ? { ...msg, content: msg.content + data.content }
                                            : msg
                                    ));
                                } else if (currentEvent === 'thinking_delta' && data.content) {
                                    // Optionally show thinking status
                                } else if (currentEvent === 'complete') {
                                    setMessages(prev => prev.map(msg =>
                                        msg.id === assistantMessageId
                                            ? { ...msg, isStreaming: false }
                                            : msg
                                    ));
                                } else if (currentEvent === 'error') {
                                    setMessages(prev => prev.map(msg =>
                                        msg.id === assistantMessageId
                                            ? { ...msg, content: `Error: ${data.message || 'Unknown error'}`, isStreaming: false }
                                            : msg
                                    ));
                                }
                            } catch (e) {
                                // Ignore JSON parse errors
                            }
                        }
                        currentEvent = 'message';
                        currentData = '';
                    } else if (line.startsWith('event:')) {
                        currentEvent = line.slice(6).trim();
                    } else if (line.startsWith('data:')) {
                        currentData = line.slice(5).trim();
                    }
                }
            }

            // Mark streaming as complete
            setMessages(prev => prev.map(msg =>
                msg.id === assistantMessageId
                    ? { ...msg, isStreaming: false }
                    : msg
            ));

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => prev.map(msg =>
                msg.id === assistantMessageId
                    ? { ...msg, content: 'Sorry, I encountered an error. Please try again.', isStreaming: false }
                    : msg
            ));
        } finally {
            setIsLoading(false);
        }
    }, [inputValue, isLoading, sessionId]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([]);
        setSessionId(`docs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                className={styles.floatingButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Close chat' : 'Open AI chat'}
            >
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className={styles.chatWindow}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.headerInfo}>
                            <span className={styles.headerIcon}>🤖</span>
                            <div>
                                <h3 className={styles.headerTitle}>AI Assistant</h3>
                                <span className={styles.headerSubtitle}>Ask about the documentation</span>
                            </div>
                        </div>
                        <button className={styles.clearButton} onClick={clearChat} title="Clear chat">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className={styles.messages}>
                        {messages.length === 0 && (
                            <div className={styles.welcomeMessage}>
                                <p>👋 Hi! I'm your AI documentation assistant.</p>
                                <p>Ask me anything about the docs!</p>
                                <div className={styles.suggestions}>
                                    <button onClick={() => setInputValue('What topics are covered in this documentation?')}>
                                        📚 What topics are covered?
                                    </button>
                                    <button onClick={() => setInputValue('Explain system design concepts')}>
                                        🏗️ System design concepts
                                    </button>
                                    <button onClick={() => setInputValue('Tell me about RAG systems')}>
                                        🔍 About RAG systems
                                    </button>
                                </div>
                            </div>
                        )}

                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`${styles.message} ${styles[message.role]}`}
                            >
                                <div className={styles.messageContent}>
                                    {message.content || (message.isStreaming && (
                                        <span className={styles.typingIndicator}>
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className={styles.inputContainer}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about the docs..."
                            disabled={isLoading}
                            className={styles.input}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!inputValue.trim() || isLoading}
                            className={styles.sendButton}
                        >
                            {isLoading ? (
                                <span className={styles.loadingSpinner}></span>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
