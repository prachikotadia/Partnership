import React, { createContext, useContext, useState, useCallback } from 'react';
import { ConfettiAnimation } from './ConfettiAnimation';
import { CheckmarkAnimation } from './CheckmarkAnimation';

interface AnimationContextType {
  showConfetti: (duration?: number) => void;
  showCheckmark: (duration?: number) => void;
  isAnimating: boolean;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};

interface AnimationProviderProps {
  children: React.ReactNode;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  const [confettiActive, setConfettiActive] = useState(false);
  const [checkmarkActive, setCheckmarkActive] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const showConfetti = useCallback((duration = 3000) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setConfettiActive(true);
  }, [isAnimating]);

  const showCheckmark = useCallback((duration = 1000) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCheckmarkActive(true);
  }, [isAnimating]);

  const handleConfettiComplete = useCallback(() => {
    setConfettiActive(false);
    setIsAnimating(false);
  }, []);

  const handleCheckmarkComplete = useCallback(() => {
    setCheckmarkActive(false);
    setIsAnimating(false);
  }, []);

  return (
    <AnimationContext.Provider
      value={{
        showConfetti,
        showCheckmark,
        isAnimating,
      }}
    >
      {children}
      
      <ConfettiAnimation
        isActive={confettiActive}
        onComplete={handleConfettiComplete}
      />
      
      <CheckmarkAnimation
        isActive={checkmarkActive}
        onComplete={handleCheckmarkComplete}
      />
    </AnimationContext.Provider>
  );
};
