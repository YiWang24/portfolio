import { useState, useEffect } from 'react';

export function useTypewriter(
  phrases: string[],
  typeSpeed = 100,
  deleteSpeed = 50,
  pauseDuration = 2000
) {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(typeSpeed);

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % phrases.length;
      const fullText = phrases[i];

      setText(isDeleting
        ? fullText.substring(0, text.length - 1)
        : fullText.substring(0, text.length + 1)
      );

      // 动态调整速度
      setTypingSpeed(isDeleting ? deleteSpeed : typeSpeed);

      // 1. 打字完成，准备暂停
      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), pauseDuration);
      }
      // 2. 删除完成，切换到下一个词
      else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, phrases, typeSpeed, deleteSpeed, pauseDuration]);

  return text;
}
