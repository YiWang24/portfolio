"use client";

import { useState, useEffect } from "react";

const phrases = [
    "Building AI-powered interfaces",
    "Crafting scalable backend systems",
    "Passionate about clean code",
    "Turning ideas into elegant solutions",
    "Bridging design and engineering",
    "Ready for new challenges",
];

export function TerminalBio() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const currentPhrase = phrases[currentIndex];

        if (isPaused) {
            const pauseTimer = setTimeout(() => {
                setIsPaused(false);
                setIsDeleting(true);
            }, 2000);
            return () => clearTimeout(pauseTimer);
        }

        if (isDeleting) {
            if (displayText.length === 0) {
                setIsDeleting(false);
                setCurrentIndex((prev) => (prev + 1) % phrases.length);
                return;
            }
            const timer = setTimeout(() => {
                setDisplayText(displayText.slice(0, -1));
            }, 30);
            return () => clearTimeout(timer);
        }

        if (displayText.length < currentPhrase.length) {
            const timer = setTimeout(() => {
                setDisplayText(currentPhrase.slice(0, displayText.length + 1));
            }, 60);
            return () => clearTimeout(timer);
        }

        // Finished typing, pause before deleting
        setIsPaused(true);
    }, [displayText, isDeleting, isPaused, currentIndex]);

    return (
        <div className="cli-motd text-center py-4">
            <p className="font-mono text-base text-muted-foreground">
                <span className="text-primary">{">"}</span>
                <span className="text-muted-foreground">{" "}</span>
                <span className="text-foreground">{displayText}</span>
                <span className="text-primary animate-pulse">▊</span>
            </p>
        </div>
    );
}
