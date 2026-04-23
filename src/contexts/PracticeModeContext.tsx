import React, { createContext, useContext, useState, useEffect } from 'react';

type AppMode = 'NORMAL' | 'PRACTICE';

interface PracticeModeContextType {
  mode: AppMode;
  toggleMode: () => void;
  setMode: (mode: AppMode) => void;
}

const PracticeModeContext = createContext<PracticeModeContextType | undefined>(undefined);

export const PracticeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<AppMode>(() => {
    const saved = localStorage.getItem('app_mode');
    return (saved as AppMode) || 'NORMAL';
  });

  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
    localStorage.setItem('app_mode', newMode);
  };

  const toggleMode = () => {
    const newMode = mode === 'NORMAL' ? 'PRACTICE' : 'NORMAL';
    setMode(newMode);
  };

  return (
    <PracticeModeContext.Provider value={{ mode, toggleMode, setMode }}>
      {children}
    </PracticeModeContext.Provider>
  );
};

export const usePracticeMode = () => {
  const context = useContext(PracticeModeContext);
  if (context === undefined) {
    throw new Error('usePracticeMode must be used within a PracticeModeProvider');
  }
  return context;
};
