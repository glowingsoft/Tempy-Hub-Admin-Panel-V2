import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * Text Animation Utilities in MUI:
 * A) FillInHeadline
 * B) MaskUpLines
 * C) CharScramble
 * D) CounterRoll
 */

export function FillInHeadline({ text, highlightText = '', theme = 'light', sx = {}, className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof window === 'undefined') return;

    const words = el.querySelectorAll('.tempy-fill-word');
    if (!words.length) return;

    const updateWords = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const end = vh * 0.3;
      const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));

      const totalWords = words.length;
      words.forEach((w, idx) => {
        const wordThreshold = idx / totalWords;
        const isRevealed = progress > wordThreshold;
        const isHighlight = w.dataset.highlight === 'true';

        if (isRevealed) {
          w.style.color = isHighlight
            ? '#5458D8'
            : theme === 'dark'
            ? '#FFFFFF'
            : '#1B1F2E';
          w.style.opacity = '1';
        } else {
          w.style.color = theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(27, 31, 46, 0.18)';
          w.style.opacity = '0.4';
        }
      });
    };

    window.addEventListener('scroll', updateWords, { passive: true });
    updateWords();
    return () => window.removeEventListener('scroll', updateWords);
  }, [theme]);

  const baseWords = text.split(' ');
  const highlightWords = highlightText ? highlightText.split(' ') : [];

  return (
    <Typography
      component="h2"
      ref={containerRef}
      className={`tempy-display ${className}`}
      sx={{
        lineHeight: 1.15,
        letterSpacing: '-0.02em',
        ...sx,
      }}
    >
      {baseWords.map((word, i) => (
        <Box
          component="span"
          key={`b-${i}`}
          className="tempy-fill-word"
          data-highlight="false"
          sx={{
            display: 'inline-block',
            mr: '0.24em',
            transition: 'color 0.25s ease, opacity 0.25s ease',
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(27, 31, 46, 0.18)',
          }}
        >
          {word}
        </Box>
      ))}
      {highlightWords.map((word, i) => (
        <Box
          component="span"
          key={`h-${i}`}
          className="tempy-fill-word"
          data-highlight="true"
          sx={{
            display: 'inline-block',
            mr: '0.24em',
            transition: 'color 0.25s ease, opacity 0.25s ease',
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(27, 31, 46, 0.18)',
          }}
        >
          {word}
        </Box>
      ))}
    </Typography>
  );
}

export function MaskUpLines({ lines = [], sx = {}, className = '', delay = 0 }) {
  const containerRef = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Box ref={containerRef} className={className} sx={{ ...sx }}>
      {lines.map((line, idx) => (
        <Box key={idx} sx={{ overflow: 'hidden', display: 'block' }}>
          <Box
            sx={{
              transform: revealed ? 'translateY(0%)' : 'translateY(110%)',
              transition: `transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) ${delay + idx * 0.12}s`,
              display: 'block',
            }}
          >
            {line}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789!<>-_\\/[]{}—=+*^?#';
export function CharScramble({ text, className = '', sx = {} }) {
  const [displayText, setDisplayText] = useState(text);
  const [started, setStarted] = useState(false);
  const elRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ' || char === '·' || char === '/' || char === '+') return char;
            if (index < iteration) return text[index];
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / 2;
    }, 30);

    return () => clearInterval(interval);
  }, [started, text]);

  return (
    <Box component="span" ref={elRef} className={`tempy-mono ${className}`} sx={{ ...sx }}>
      {displayText}
    </Box>
  );
}

export function CounterRoll({ target, prefix = '', suffix = '', duration = 1600, className = '', sx = {} }) {
  const [count, setCount] = useState(0);
  const [showSuffix, setShowSuffix] = useState(false);
  const elRef = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    let startTime = null;
    let animId = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 2);
      const currentVal = Math.floor(ease * target);

      setCount(currentVal);

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        setShowSuffix(true);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [started, target, duration]);

  const formattedCount = count >= 1000 ? count.toLocaleString() : count;

  return (
    <Typography component="span" ref={elRef} className={`tempy-display ${className}`} sx={{ ...sx }}>
      {prefix}
      {formattedCount}
      <Box
        component="span"
        sx={{
          opacity: showSuffix ? 1 : 0.2,
          transition: 'opacity 0.4s ease',
          color: 'var(--indigo)',
        }}
      >
        {suffix}
      </Box>
    </Typography>
  );
}
