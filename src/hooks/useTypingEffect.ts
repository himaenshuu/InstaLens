import { useState, useEffect } from "react";

/**
 * Custom hook for typing animation effect
 * @param text - The text to animate
 * @param speed - Typing speed in milliseconds (default: 100ms)
 * @param startDelay - Delay before starting animation (default: 500ms)
 */
export const useTypingEffect = (
  text: string,
  speed: number = 100,
  startDelay: number = 500
): string => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Wait for start delay
    const delayTimeout = setTimeout(() => {
      if (currentIndex < text.length) {
        const typingTimeout = setTimeout(() => {
          setDisplayedText((prev) => prev + text[currentIndex]);
          setCurrentIndex((prev) => prev + 1);
        }, speed);

        return () => clearTimeout(typingTimeout);
      }
    }, startDelay);

    return () => clearTimeout(delayTimeout);
  }, [currentIndex, text, speed, startDelay]);

  return displayedText;
};
