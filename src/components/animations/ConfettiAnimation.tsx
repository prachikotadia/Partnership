import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

interface ConfettiAnimationProps {
  isActive: boolean;
  onComplete: () => void;
  duration?: number;
  colors?: string[];
}

export const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({
  isActive,
  onComplete,
  duration = 3000,
  colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3']
}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const animationRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(isActive);
  const onCompleteRef = useRef(onComplete);
  const durationRef = useRef(duration);
  const colorsRef = useRef(colors);

  // Update refs when props change
  useEffect(() => {
    isActiveRef.current = isActive;
    onCompleteRef.current = onComplete;
    durationRef.current = duration;
    colorsRef.current = colors;
  }, [isActive, onComplete, duration, colors]);

  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setPieces([]);
  }, []);

  const startAnimation = useCallback(() => {
    if (!isActiveRef.current) return;

    // Create confetti pieces
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 50; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -10,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        color: colorsRef.current[Math.floor(Math.random() * colorsRef.current.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }
    setPieces(newPieces);

    // Start animation loop
    const animate = () => {
      if (!isActiveRef.current) {
        return;
      }

      setPieces(prevPieces => {
        const updatedPieces = prevPieces.map(piece => ({
          ...piece,
          x: piece.x + piece.vx,
          y: piece.y + piece.vy,
          vy: piece.vy + 0.1, // gravity
          rotation: piece.rotation + piece.rotationSpeed,
        })).filter(piece => piece.y < window.innerHeight + 50);

        // Continue animation if there are still pieces and animation is active
        if (updatedPieces.length > 0 && isActiveRef.current) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Animation complete - schedule completion callback outside of render cycle
          animationRef.current = null;
          if (isActiveRef.current) {
            // Use setTimeout to defer the callback outside of the render cycle
            setTimeout(() => {
              if (isActiveRef.current) {
                onCompleteRef.current();
              }
            }, 0);
          }
        }

        return updatedPieces;
      });
    };

    // Start the animation
    animationRef.current = requestAnimationFrame(animate);

    // Stop animation after duration
    timeoutRef.current = setTimeout(() => {
      cleanup();
      if (isActiveRef.current) {
        onCompleteRef.current();
      }
    }, durationRef.current);
  }, [cleanup]);

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      cleanup();
    }

    return cleanup;
  }, [isActive, startAnimation, cleanup]);

  if (!isActive || pieces.length === 0) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: piece.x,
            top: piece.y,
            backgroundColor: piece.color,
            width: piece.size,
            height: piece.size,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
    </div>,
    document.body
  );
};