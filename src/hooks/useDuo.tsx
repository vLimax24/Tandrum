// context/DuoContext.tsx
import React, { createContext, useContext, useState } from "react";

type DuoContextType = {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
};

const DuoContext = createContext<DuoContextType | undefined>(undefined);

export const DuoProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <DuoContext.Provider value={{ selectedIndex, setSelectedIndex }}>
      {children}
    </DuoContext.Provider>
  );
};

export const useDuo = () => {
  const context = useContext(DuoContext);
  if (!context) throw new Error("useDuo must be used within DuoProvider");
  return context;
};
