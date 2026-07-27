'use client';
import { useState, useEffect } from 'react';

export default function Typewriter({ title = '', titleHighlight = '', speed = 25, delay = 200 }) {
  const [displayedTitle, setDisplayedTitle] = useState('');
  const [displayedHighlight, setDisplayedHighlight] = useState('');
  const [isTypingHighlight, setIsTypingHighlight] = useState(false);

  useEffect(() => {
    let timeout;
    
    if (!isTypingHighlight) {
      if (displayedTitle.length < title.length) {
        timeout = setTimeout(() => {
          setDisplayedTitle(title.slice(0, displayedTitle.length + 1));
        }, speed);
      } else {
        timeout = setTimeout(() => {
          setIsTypingHighlight(true);
        }, delay);
      }
    } else {
      if (displayedHighlight.length < titleHighlight.length) {
        timeout = setTimeout(() => {
          setDisplayedHighlight(titleHighlight.slice(0, displayedHighlight.length + 1));
        }, speed);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedTitle, displayedHighlight, isTypingHighlight, title, titleHighlight, speed, delay]);

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {displayedTitle}
      {isTypingHighlight || displayedTitle.length === title.length ? <br /> : null}
      
      {isTypingHighlight && (
        <span style={{
          color: '#FFDD00',
          paddingRight: '8px' // Space for cursor
        }}>
          {displayedHighlight}
        </span>
      )}

      {/* Yellow Cursor */}
      <span style={{
        display: 'inline-block',
        width: '4px',
        height: '1.05em',
        verticalAlign: 'text-bottom',
        marginLeft: '4px',
        borderRadius: '2px',
        background: '#FFDD00',
        animation: 'cursorBlink 1s step-end infinite'
      }} />
      <style>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}
